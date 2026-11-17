
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
    llm_score: float = None
) -> dict:
    """
    Calculate an overall risk score using available analysis results.

    Missing components are excluded, and the remaining weights
    are proportionally adjusted.
    """

    component_weights = {
        "text": 0.15,
        "url": 0.35,
        "llm": 0.50
    }

    component_scores = {
        "text": text_score,
        "url": url_score,
        "llm": llm_score
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
