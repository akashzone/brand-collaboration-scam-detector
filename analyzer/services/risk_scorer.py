
from datetime import datetime, timezone


def get_risk_level(score: int) -> str:
    """Convert a numerical score into a risk classification."""

    if score < 30:
        return "Low"

    if score < 60:
        return "Medium"

    if score < 80:
        return "High"

    return "Critical"


def calculate_risk_score(
    text_score: float = None,
    url_score: float = None,
    llm_score: float = None,
    rdap_score: float = None
) -> dict:
    """
    Calculate an overall risk score using available analysis results.

    Missing components are excluded, and the remaining weights
    are proportionally adjusted.
    """

    component_weights = {
        "text": 0.15,
        "url": 0.30,
        "llm": 0.40,
        "rdap": 0.15
    }

    component_scores = {
        "text": text_score,
        "url": url_score,
        "llm": llm_score,
        "rdap": rdap_score
    }

    available_components = {}

    for component, score in component_scores.items():

        if score is None:
            continue

        if isinstance(score, bool) or not isinstance(score, (int, float)):
            raise ValueError(f"{component} score must be numeric")

        if not 0 <= score <= 100:
            raise ValueError(f"{component} score must be between 0 and 100")

        available_components[component] = score

    if not available_components:
        return {
            "riskScore": None,
            "riskLevel": "Unknown",
            "classification": "Insufficient Data",
            "componentScores": {},
            "message": "No analysis results are available."
        }

    total_available_weight = sum(
        component_weights[component]
        for component in available_components
    )

    weighted_score = sum(
        score * component_weights[component]
        for component, score in available_components.items()
    )

    final_score = round(weighted_score / total_available_weight)

    risk_level = get_risk_level(final_score)

    return {
        "riskScore": final_score,
        "riskLevel": risk_level,
        "classification": (
            "Potential Scam"
            if risk_level in ["High", "Critical"]
            else "No Significant Risk Indicators Detected"
        ),
        "componentScores": available_components,
        "message": "Risk assessment calculated successfully."
    }



def calculate_text_component_score(text_analysis: dict) -> int:
    """
    Calculate a numerical risk score from text analysis indicators.
    Each indicator contributes points based on its severity.
    """

    severity_points = {
        "high": 30,
        "medium": 15,
        "low": 5
    }

    indicators = text_analysis.get("indicators", [])

    total_score = 0

    for indicator in indicators:
        severity = indicator.get("severity", "").lower()

        points = severity_points.get(severity, 0)

        total_score += points

    return min(total_score, 100)






def calculate_url_component_score(url_analysis: list) -> int | None:
    """
    Calculate URL risk using the highest individual URL score.

    Invalid or incomplete URL analysis results are skipped.
    Returns None if no valid URL analysis is available.
    """

    individual_scores = []

    url_points = {
        "ip_based": 30,
        "shortened": 25,
        "suspicious_patterns": 25,
        "insecure_http": 10,
        "brand_impersonation": 30
    }

    required_sections = {
        "ipAnalysis": "isIpBased",
        "shortenerAnalysis": "isShortened",
        "suspiciousPatterns": "isSuspicious",
        "httpsAnalysis": "isHttps"
    }

    for result in url_analysis:

        if not isinstance(result, dict):
            continue

        if result.get("status") != "analysis_completed":
            continue

        # Validate all required analysis sections.
        valid_result = True

        for section, indicator in required_sections.items():
            section_data = result.get(section)

            if not isinstance(section_data, dict):
                valid_result = False
                break

            if not isinstance(section_data.get(indicator), bool):
                valid_result = False
                break

        if not valid_result:
            continue

        # Brand analysis is optional, but must be valid if provided.
        brand_analysis = result.get("brandAnalysis")

        if brand_analysis is not None:
            if not isinstance(brand_analysis, dict):
                continue

            if not isinstance(
                brand_analysis.get("matchesOfficialDomain"), bool
            ):
                continue

        url_score = 0

        ip_analysis = result["ipAnalysis"]
        shortener_analysis = result["shortenerAnalysis"]
        suspicious_patterns = result["suspiciousPatterns"]
        https_analysis = result["httpsAnalysis"]

        if ip_analysis["isIpBased"]:
            url_score += url_points["ip_based"]

        if shortener_analysis["isShortened"]:
            url_score += url_points["shortened"]

        if suspicious_patterns["isSuspicious"]:
            url_score += url_points["suspicious_patterns"]

        if not https_analysis["isHttps"]:
            url_score += url_points["insecure_http"]

        if (
            brand_analysis is not None
            and brand_analysis["matchesOfficialDomain"] is False
        ):
            url_score += url_points["brand_impersonation"]

        individual_scores.append(min(url_score, 100))

    if not individual_scores:
        return None

    return max(individual_scores)


def calculate_domain_component_score(domain_analysis: list) -> int | None:
    """
    Calculate an RDAP domain risk score between 0 and 100 from existing domain intelligence results.
    The highest individual domain score is used as the overall component score.
    Returns None if no domains were successfully analyzed or input is invalid.
    """
    if not isinstance(domain_analysis, list) or not domain_analysis:
        return None

    individual_scores = []

    for result in domain_analysis:
        if not isinstance(result, dict):
            continue

        if result.get("status") != "completed":
            continue

        domain_score = 0

        # --- Domain Age (mutually exclusive) ---
        age_analysis = result.get("ageAnalysis")
        if isinstance(age_analysis, dict) and age_analysis.get("status") == "completed":
            age_days = age_analysis.get("ageDays")
            if isinstance(age_days, (int, float)) and age_days >= 0:
                if age_days < 30:
                    domain_score += 30
                elif age_days < 90:
                    domain_score += 20
                elif age_days < 365:
                    domain_score += 10
                # 365 days or older receives 0 points

        # --- Domain Lifecycle Indicators ---
        # 1. Expired domain (40 points)
        is_expired = False
        indicators = result.get("indicators", [])
        if isinstance(indicators, list):
            for ind in indicators:
                if isinstance(ind, dict) and ind.get("type") == "expired_domain":
                    is_expired = True
                    break

        if not is_expired:
            reg_info = result.get("registrationInfo")
            if isinstance(reg_info, dict):
                exp_date_str = reg_info.get("expirationDate")
                if isinstance(exp_date_str, str):
                    try:
                        exp_dt = datetime.fromisoformat(exp_date_str.replace("Z", "+00:00"))
                        if exp_dt.tzinfo is None:
                            exp_dt = exp_dt.replace(tzinfo=timezone.utc)
                        if exp_dt <= datetime.now(timezone.utc):
                            is_expired = True
                    except (ValueError, TypeError):
                        pass

        if is_expired:
            domain_score += 40

        # 2. Status flags (clientHold: 30, serverHold: 30, redemptionPeriod: 40, pendingDelete: 40)
        raw_statuses = []
        reg_info = result.get("registrationInfo")
        if isinstance(reg_info, dict):
            status_list = reg_info.get("domainStatus", [])
            if isinstance(status_list, list):
                raw_statuses.extend(status_list)

        if isinstance(indicators, list):
            for ind in indicators:
                if isinstance(ind, dict) and ind.get("type") == "domain_status":
                    ev = ind.get("evidence", "")
                    if "Domain status:" in ev:
                        raw_statuses.append(ev.split("Domain status:")[-1].strip())

        normalized_statuses = {
            s.lower().replace(" ", "").replace("-", "")
            for s in raw_statuses
            if isinstance(s, str)
        }

        if "clienthold" in normalized_statuses:
            domain_score += 30
        if "serverhold" in normalized_statuses:
            domain_score += 30
        if "redemptionperiod" in normalized_statuses:
            domain_score += 40
        if "pendingdelete" in normalized_statuses:
            domain_score += 40

        individual_scores.append(min(domain_score, 100))

    if not individual_scores:
        return None

    return max(individual_scores)

