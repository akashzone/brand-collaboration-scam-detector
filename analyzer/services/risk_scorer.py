
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
    Calculate a numerical risk score from URL analysis results.
    """

    total_score = 0

    url_points = {
        "ip_based": 30,
        "shortened": 25,
        "suspicious_patterns": 25,
        "insecure_http": 10,
        "brand_impersonation": 30
    }

    for result in url_analysis:
        if result.get("status") != "analysis_completed":
            continue

        ip_analysis = result.get("ipAnalysis", {})
        shortener_analysis = result.get("shortenerAnalysis", {})
        suspicious_patterns = result.get("suspiciousPatterns", {})
        https_analysis = result.get("httpsAnalysis", {})
        brand_analysis = result.get("brandAnalysis")

        if ip_analysis.get("isIpBased"):
            total_score += url_points["ip_based"]

        if shortener_analysis.get("isShortened"):
            total_score += url_points["shortened"]

        if suspicious_patterns.get("isSuspicious"):
            total_score += url_points["suspicious_patterns"]

        if not https_analysis.get("isHttps"):
            total_score += url_points["insecure_http"]

        if brand_analysis and brand_analysis.get("matchesOfficialDomain") is False:
            total_score += url_points["brand_impersonation"]

    if not url_analysis:
        return None

    return min(total_score, 100)
