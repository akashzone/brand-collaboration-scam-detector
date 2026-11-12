
from urllib.parse import urlsplit, urlunsplit
import ipaddress
from services.brand_catalog import BRAND_DOMAINS

URL_SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "shorturl.at",
    "is.gd",
    "buff.ly",
    "ow.ly",
    "rebrand.ly",
    "cutt.ly",
    "rb.gy"
}

SUSPICIOUS_KEYWORDS = {
    "login",
    "verify",
    "verification",
    "account",
    "secure",
    "password",
    "credential",
    "signin",
    "update",
    "confirm"
}

MAX_SUBDOMAIN_LABELS = 3

def detect_ip_based_url(url: str) -> dict:
    normalized_url = normalize_url(url)

    if normalized_url is None:
        return {
            "isIpBased": False,
            "ipAddress": None,
            "ipVersion": None
        }

    parsed = urlsplit(normalized_url)
    hostname = parsed.hostname

    try:
        ip = ipaddress.ip_address(hostname)

        return {
            "isIpBased": True,
            "ipAddress": str(ip),
            "ipVersion": ip.version
        }

    except ValueError:
        return {
            "isIpBased": False,
            "ipAddress": None,
            "ipVersion": None
        }


def detect_url_shortener(url: str) -> dict:
    normalized_url = normalize_url(url)

    if normalized_url is None:
        return {
            "isShortened": False,
            "shortenerDomain": None
        }

    parsed = urlsplit(normalized_url)

    hostname = parsed.hostname.lower()

    # Remove www. prefix
    if hostname.startswith("www."):
        hostname = hostname[4:]

    if hostname in URL_SHORTENERS:
        return {
            "isShortened": True,
            "shortenerDomain": hostname
        }

    return {
        "isShortened": False,
        "shortenerDomain": None
    }


def detect_suspicious_url_patterns(url: str) -> dict:
    normalized_url = normalize_url(url)

    if normalized_url is None:
        return {
            "isSuspicious": False,
            "findings": []
        }

    parsed = urlsplit(normalized_url)

    hostname = parsed.hostname.lower()

    findings = []

    # Check suspicious keywords in the hostname
    hostname_labels = hostname.split(".")

    matched_keywords = [
        keyword
        for keyword in SUSPICIOUS_KEYWORDS
        if any(
            keyword in label
            for label in hostname_labels
        )
    ]

    if matched_keywords:
        findings.append({
            "type": "suspicious_keywords",
            "description": "The hostname contains security-sensitive keywords.",
            "evidence": matched_keywords
        })

    # Check excessive subdomains
    if len(hostname_labels) > MAX_SUBDOMAIN_LABELS + 1:
        findings.append({
            "type": "excessive_subdomains",
            "description": "The hostname contains an unusually large number of subdomain labels.",
            "evidence": hostname
        })

    # Check for misleading @ symbol
    if "@" in parsed.netloc:
        findings.append({
            "type": "misleading_url_structure",
            "description": "The URL contains an @ symbol in its authority section.",
            "evidence": parsed.netloc
        })

    return {
        "isSuspicious": len(findings) > 0,
        "findings": findings
    }


def analyze_https(url: str) -> dict:
    normalized_url = normalize_url(url)

    if normalized_url is None:
        return {
            "isHttps": None,
            "protocol": None,
            "finding": "invalid_url"
        }

    parsed = urlsplit(normalized_url)

    protocol = parsed.scheme.lower()

    if protocol == "https":
        return {
            "isHttps": True,
            "protocol": protocol,
            "finding": None
        }

    return {
        "isHttps": False,
        "protocol": protocol,
        "finding": "insecure_http"
    }


def detect_brand_impersonation(url: str, brand: str) -> dict:
    normalized_url = normalize_url(url)

    if normalized_url is None:
        return {
            "brand": brand,
            "domain": None,
            "isOfficialDomain": False,
            "isPotentialImpersonation": False,
            "finding": "invalid_url"
        }

    brand_key = brand.lower().strip()

    if brand_key not in BRAND_DOMAINS:
        return {
            "brand": brand,
            "domain": None,
            "isOfficialDomain": False,
            "isPotentialImpersonation": False,
            "finding": "unknown_brand"
        }

    parsed = urlsplit(normalized_url)
    hostname = parsed.hostname.lower().rstrip(".")

    official_domains = BRAND_DOMAINS[brand_key]["official_domains"]

    # Check whether the hostname matches an official domain
    is_official = any(
        hostname == official_domain
        or hostname.endswith("." + official_domain)
        for official_domain in official_domains
    )

    # Check whether the brand name appears in the hostname
    contains_brand_name = brand_key in hostname

    is_potential_impersonation = (
        contains_brand_name and not is_official
    )

    if is_official:
        finding = None
    elif is_potential_impersonation:
        finding = "potential_brand_impersonation"
    else:
        finding = None

    return {
        "brand": brand.title(),
        "domain": hostname,
        "isOfficialDomain": is_official,
        "isPotentialImpersonation": is_potential_impersonation,
        "finding": finding
    }


def normalize_url(url: str) -> str | None:
    # Remove whitespace and trailing punctuation
    url = url.strip().rstrip(".,!?;:")

    if not url:
        return None

    # Add HTTPS if the URL has no scheme
    if "://" not in url:
        url = "https://" + url

    try:
        parsed = urlsplit(url)

        # Only allow HTTP and HTTPS URLs
        scheme = parsed.scheme.lower()

        if scheme not in ("http", "https"):
            return None

        # Reject URLs without a hostname
        if not parsed.hostname:
            return None

        # Reject URLs containing embedded credentials
        if parsed.username or parsed.password:
            return None

        # Normalize hostname
        hostname = parsed.hostname.lower()

        # Preserve IPv6 address formatting
        if ":" in hostname:
            hostname = f"[{hostname}]"

        # Preserve the port, if present
        port = parsed.port

        netloc = hostname

        if port is not None:
            netloc = f"{hostname}:{port}"

        return urlunsplit((
            scheme,
            netloc,
            parsed.path,
            parsed.query,
            parsed.fragment
        ))

    except ValueError:
        return None



def analyze_url(url: str, brand: str = None) -> dict:
    normalized_url = normalize_url(url)

    if normalized_url is None:
        return {
            "url": url,
            "normalizedUrl": None,
            "status": "invalid_url",
            "ipAnalysis": None,
            "shortenerAnalysis": None,
            "suspiciousPatterns": None,
            "httpsAnalysis": None,
            "brandAnalysis": None
        }

    result = {
        "url": url,
        "normalizedUrl": normalized_url,
        "status": "analysis_completed",
        "ipAnalysis": detect_ip_based_url(normalized_url),
        "shortenerAnalysis": detect_url_shortener(normalized_url),
        "suspiciousPatterns": detect_suspicious_url_patterns(
            normalized_url
        ),
        "httpsAnalysis": analyze_https(normalized_url),
        "brandAnalysis": None
    }

    if brand:
        result["brandAnalysis"] = detect_brand_impersonation(
            normalized_url,
            brand
        )

    return result
