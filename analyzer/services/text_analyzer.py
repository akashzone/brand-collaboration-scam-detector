
import re


# Suspicious patterns to identify in collaboration messages
DETECTION_RULES = [
    {
        "id": "urgency_language",
        "category": "pressure_tactics",
        "severity": "medium",
        "description": "The message uses urgent or pressuring language.",
        "pattern": (
            r"\b(immediately|urgently|act now|"
            r"limited[- ]time|expires today|"
            r"within \d+ hours?)\b"
        )
    },
    {
        "id": "upfront_payment",
        "category": "financial_request",
        "severity": "high",
        "description": "The message appears to request an upfront payment.",
        "pattern": (
            r"\b(registration fee|processing fee|"
            r"security deposit|advance payment|"
            r"pay (?:a )?fee|payment required)\b"
        )
    },
    {
        "id": "credential_request",
        "category": "credential_theft",
        "severity": "high",
        "description": "The message requests sensitive account information.",
        "pattern": (
            r"\b(password|login credentials|"
            r"verification code|one[- ]time password|"
            r"OTP|2FA code|account access)\b"
        )
    },
    {
        "id": "off_platform_contact",
        "category": "communication_risk",
        "severity": "medium",
        "description": "The message encourages communication through an external platform.",
        "pattern": (
            r"\b(contact|message|reach) us on "
            r"(WhatsApp|Telegram|Signal)\b"
        )
    }
]


def analyze_text(message: str) -> dict:
    indicators = []

    for rule in DETECTION_RULES:
        matches = re.finditer(
            rule["pattern"],
            message,
            re.IGNORECASE
        )

        evidence = []

        for match in matches:
            matched_text = match.group(0)
            
            if matched_text.lower() not in [
                item.lower() for item in evidence
            ]:
                evidence.append(matched_text)

        if evidence:
            indicators.append({
                "id": rule["id"],
                "category": rule["category"],
                "severity": rule["severity"],
                "description": rule["description"],
                "evidence": evidence
            })

    return {
        "indicatorCount": len(indicators),
        "indicators": indicators
    }

