
import re

from urllib.parse import urlparse
from services.brand_catalog import BRAND_DOMAINS

URL_PATTERN = re.compile(
    r"\b(?:https?://|www\.)[^\s<>()]+",
    re.IGNORECASE
)

EMAIL_PATTERN = re.compile(
    r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
    re.IGNORECASE
)


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


def extract_domains(entities: dict) -> list:
    domains = []

    # Extract domains from URLs
    for url in entities["urls"]:
        parsed_url = urlparse(url)

        domain = parsed_url.netloc.lower()

        # Remove www. prefix
        if domain.startswith("www."):
            domain = domain[4:]

        if domain:
            domains.append(domain)

    # Extract domains from email addresses
    for email in entities["emailAddresses"]:
        domain = email.split("@")[-1].lower()

        if domain.startswith("www."):
            domain = domain[4:]

        if domain:
            domains.append(domain)

    # Remove duplicates
    return list(dict.fromkeys(domains))


def check_brand_domains(message: str, domains: list) -> list:
    brand_checks = []

    for brand, details in BRAND_DOMAINS.items():

        # Check whether the brand is mentioned in the message
        brand_pattern = rf"\b{re.escape(brand)}\b"

        if not re.search(brand_pattern, message, re.IGNORECASE):
            continue

        official_domains = details["official_domains"]

        for domain in domains:

            # Check whether the extracted domain matches
            # an official domain or its subdomain
            is_official = any(
                domain == official_domain
                or domain.endswith("." + official_domain)
                for official_domain in official_domains
            )

            brand_checks.append({
                "brand": brand.title(),
                "domain": domain,
                "matchesOfficialDomain": is_official,
                "expectedDomains": official_domains
            })

    return brand_checks


def extract_entities(message: str) -> dict:
    # Extract URLs
    urls = URL_PATTERN.findall(message)

    # Remove punctuation accidentally captured at the end.
    urls = [
        url.rstrip(".,!?;:")
        for url in urls
    ]

    # Extract email addresses
    email_addresses = EMAIL_PATTERN.findall(message)

    # Remove duplicate entries without changing original casing.
    def remove_duplicates(items):
        unique_items = []
        seen = set()

        for item in items:
            normalized = item.lower()

            if normalized not in seen:
                seen.add(normalized)
                unique_items.append(item)

        return unique_items

    return {
        "urls": remove_duplicates(urls),
        "emailAddresses": remove_duplicates(email_addresses)
    }


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
    entities = extract_entities(message)

    domains = extract_domains(entities)

    brand_checks = check_brand_domains(
        message,
        domains
    )

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
    "indicators": indicators,
    "entities": entities,
    "brandDomainChecks": brand_checks
    }


def generate_text_summary(indicators: list) -> dict:
    severity_counts = {
        "high": 0,
        "medium": 0,
        "low": 0
    }

    for indicator in indicators:
        severity = indicator["severity"].lower()

        if severity in severity_counts:
            severity_counts[severity] += 1

    total_indicators = len(indicators)

    # Determine the preliminary text risk classification.
    if severity_counts["high"] > 0:
        classification = "High"

    elif severity_counts["medium"] > 0:
        classification = "Medium"

    elif severity_counts["low"] > 0:
        classification = "Low"

    else:
        classification = "No indicators"

    # Generate an explanation.
    if total_indicators == 0:
        explanation = (
            "No known suspicious patterns were detected "
            "in the submitted message."
        )
    else:
        explanation = (
            f"Detected {total_indicators} suspicious "
            f"indicator(s): {severity_counts['high']} high, "
            f"{severity_counts['medium']} medium, and "
            f"{severity_counts['low']} low severity."
        )

    return {
        "totalIndicators": total_indicators,
        "severityCounts": severity_counts,
        "classification": classification,
        "explanation": explanation
    }
