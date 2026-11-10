
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
        "id": "shipping_fee_request",
        "category": "financial_request",
        "severity": "medium",
        "description": "The message requests payment for shipping, delivery, or courier charges.",
        "pattern": (
            r"\b(shipping fee|shipping charges|"
            r"delivery fee|delivery charges|"
            r"courier fee|courier charges|"
            r"pay for shipping|pay shipping costs)\b"
        )
    },
    {
        "id": "social_account_access",
        "category": "account_security",
        "severity": "high",
        "description": "The message requests access or administrative control of a social media account.",
        "pattern": (
            r"\b(add us as (?:an )?admin|"
            r"make us (?:an )?admin|"
            r"grant us access|"
            r"connect your Instagram account|"
            r"authorize our app)\b"
        )
    },
    {
        "id": "credential_request",
        "category": "credential_theft",
        "severity": "high",
        "description": "The message requests sensitive account information.",
        "pattern": (
            r"\b(password|login credentials|"
            r"verification code|security code|"
            r"login code|access code|"
            r"one[- ]time password|"
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


def is_negated_request(message: str, match_start: int) -> bool:
    # Find the beginning of the current sentence.
    previous_text = message[:match_start]

    sentence_start = max(
        previous_text.rfind("."),
        previous_text.rfind("!"),
        previous_text.rfind("?"),
        previous_text.rfind(";"),
        previous_text.rfind("\n")
    ) + 1

    context = previous_text[sentence_start:]

    negation_pattern = (
        r"\b(?:we|our team|the brand)\s+"
        r"(?:never|do not|don't|does not|doesn't)\s+"
        r"(?:ask|asks|request|requests|require|requires)\b"
    )

    return bool(
        re.search(
            negation_pattern,
            context,
            re.IGNORECASE
        )
    )


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
            if is_negated_request(message, match.start()):
                continue
            
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

