
import ipaddress
import re
from urllib.parse import urlparse

import requests

from datetime import datetime, timezone


RDAP_BASE_URL = "https://rdap.org/domain/"
REQUEST_TIMEOUT = 10


def normalize_domain(domain: str) -> str:
    """
    Accept a domain or URL and return a normalized domain name.
    """

    if not isinstance(domain, str) or not domain.strip():
        raise ValueError("A valid domain is required.")

    domain = domain.strip()

    # Extract hostname if the input is a complete URL.
    if "://" in domain:
        parsed = urlparse(domain)

        if parsed.scheme.lower() not in ("http", "https"):
            raise ValueError("Only HTTP and HTTPS URLs are supported.")

        if parsed.username or parsed.password:
            raise ValueError("URLs containing credentials are not allowed.")

        hostname = parsed.hostname

    else:
        # Remove a possible path from a domain-only input.
        hostname = domain.split("/")[0]

        # Remove a possible port.
        if hostname.count(":") == 1:
            hostname = hostname.split(":")[0]

    if not hostname:
        raise ValueError("Invalid domain name.")

    hostname = hostname.rstrip(".").lower()

    # Convert internationalized domain names to ASCII.
    try:
        hostname = hostname.encode("idna").decode("ascii")
    except UnicodeError:
        raise ValueError("Invalid internationalized domain name.")

    # IP addresses are not domain names.
    try:
        ipaddress.ip_address(hostname)
        raise ValueError("IP addresses are not supported for domain lookup.")
    except ValueError as error:
        if str(error).startswith("IP addresses"):
            raise

    # Basic domain format validation.
    if len(hostname) > 253:
        raise ValueError("Domain name is too long.")

    labels = hostname.split(".")

    if len(labels) < 2:
        raise ValueError("A fully qualified domain name is required.")

    label_pattern = re.compile(
        r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$"
    )

    if any(not label_pattern.fullmatch(label) for label in labels):
        raise ValueError("Invalid domain name.")

    return hostname


def fetch_domain_rdap(domain: str) -> dict:
    """
    Fetch raw RDAP registration data for a domain.
    """

    try:
        normalized_domain = normalize_domain(domain)

    except ValueError as error:
        return {
            "status": "invalid_domain",
            "domain": None,
            "message": str(error)
        }

    rdap_url = f"{RDAP_BASE_URL}{normalized_domain}"

    try:
        response = requests.get(
            rdap_url,
            headers={
                "Accept": "application/rdap+json"
            },
            timeout=REQUEST_TIMEOUT
        )

        if response.status_code == 404:
            return {
                "status": "not_found",
                "domain": normalized_domain,
                "message": "No RDAP registration record was found."
            }

        if response.status_code == 429:
            return {
                "status": "rate_limited",
                "domain": normalized_domain,
                "message": "RDAP service rate limit reached."
            }

        if not response.ok:
            return {
                "status": "unavailable",
                "domain": normalized_domain,
                "message": f"RDAP service returned HTTP {response.status_code}."
            }

        try:
            rdap_data = response.json()
        except ValueError:
            return {
                "status": "unavailable",
                "domain": normalized_domain,
                "message": "RDAP returned an invalid JSON response."
            }

        if not isinstance(rdap_data, dict):
            return {
                "status": "unavailable",
                "domain": normalized_domain,
                "message": "RDAP returned an unexpected response format."
            }

        return {
            "status": "success",
            "domain": normalized_domain,
            "data": rdap_data
        }

    except requests.Timeout:
        return {
            "status": "unavailable",
            "domain": normalized_domain,
            "message": "RDAP request timed out."
        }

    except requests.RequestException:
        return {
            "status": "unavailable",
            "domain": normalized_domain,
            "message": "Unable to connect to the RDAP service."
        }



def extract_domain_info(rdap_result: dict) -> dict:
    """
    Extract useful registration information from an RDAP result.
    """

    if not isinstance(rdap_result, dict):
        raise ValueError("RDAP result must be a dictionary.")

    if rdap_result.get("status") != "success":
        return {
            "status": rdap_result.get("status", "unavailable"),
            "domain": rdap_result.get("domain"),
            "message": rdap_result.get(
                "message",
                "RDAP information is unavailable."
            )
        }

    data = rdap_result.get("data")

    if not isinstance(data, dict):
        return {
            "status": "unavailable",
            "domain": rdap_result.get("domain"),
            "message": "Invalid RDAP data."
        }

    registration_date = None
    expiration_date = None
    last_updated = None

    # Extract dates from RDAP events.
    events = data.get("events", [])

    if isinstance(events, list):
        for event in events:
            if not isinstance(event, dict):
                continue

            action = event.get("eventAction")
            date = event.get("eventDate")

            if not isinstance(date, str):
                continue

            if action == "registration":
                registration_date = date

            elif action == "expiration":
                expiration_date = date

            elif action == "last changed":
                last_updated = date

    # Extract registrar name from entities.
    registrar = None
    entities = data.get("entities", [])

    if isinstance(entities, list):
        for entity in entities:
            if not isinstance(entity, dict):
                continue

            roles = entity.get("roles", [])

            if not isinstance(roles, list) or "registrar" not in roles:
                continue

            vcard = entity.get("vcardArray")

            if (
                isinstance(vcard, list)
                and len(vcard) > 1
                and isinstance(vcard[1], list)
            ):
                for field in vcard[1]:
                    if (
                        isinstance(field, list)
                        and len(field) >= 4
                        and field[0] == "fn"
                        and isinstance(field[3], str)
                    ):
                        registrar = field[3]
                        break

            if registrar:
                break

    # Extract domain statuses.
    domain_status = data.get("status", [])

    if not isinstance(domain_status, list):
        domain_status = []

    domain_status = [
        status for status in domain_status
        if isinstance(status, str)
    ]

    return {
        "status": "completed",
        "domain": rdap_result.get("domain"),
        "registrationDate": registration_date,
        "expirationDate": expiration_date,
        "lastUpdated": last_updated,
        "registrar": registrar,
        "domainStatus": domain_status
    }

def calculate_domain_age(registration_date: str) -> dict:
    """
    Calculate domain age using its RDAP registration date.
    """

    if not isinstance(registration_date, str) or not registration_date.strip():
        return {
            "status": "unavailable",
            "ageDays": None,
            "ageYears": None,
            "warningLevel": "unknown",
            "message": "Registration date is unavailable."
        }

    try:
        registered_at = datetime.fromisoformat(
            registration_date.replace("Z", "+00:00")
        )

        # Treat dates without timezone information as UTC.
        if registered_at.tzinfo is None:
            registered_at = registered_at.replace(tzinfo=timezone.utc)

        registered_at = registered_at.astimezone(timezone.utc)
        current_time = datetime.now(timezone.utc)

        age_in_days = (current_time - registered_at).days

        if age_in_days < 0:
            return {
                "status": "unavailable",
                "ageDays": None,
                "ageYears": None,
                "warningLevel": "unknown",
                "message": "Registration date is in the future."
            }

        age_in_years = round(age_in_days / 365.25, 2)

        if age_in_days < 30:
            warning_level = "high"

        elif age_in_days < 90:
            warning_level = "medium"

        elif age_in_days < 365:
            warning_level = "low"

        else:
            warning_level = "none"

        return {
            "status": "completed",
            "ageDays": age_in_days,
            "ageYears": age_in_years,
            "warningLevel": warning_level,
            "message": "Domain age calculated successfully."
        }

    except ValueError:
        return {
            "status": "unavailable",
            "ageDays": None,
            "ageYears": None,
            "warningLevel": "unknown",
            "message": "Invalid registration date format."
        }



def analyze_domain_intelligence(domain: str) -> dict:
    """
    Perform complete domain intelligence analysis using RDAP.
    """

    # Step 1: Fetch RDAP registration data.
    rdap_result = fetch_domain_rdap(domain)

    # Stop if RDAP lookup was unsuccessful.
    if rdap_result.get("status") != "success":
        return {
            "status": rdap_result.get("status", "unavailable"),
            "domain": rdap_result.get("domain"),
            "message": rdap_result.get("message"),
            "indicators": [],
            "dataQualityWarnings": []
        }

    # Step 2: Extract useful registration information.
    domain_info = extract_domain_info(rdap_result)

    if domain_info.get("status") != "completed":
        return {
            "status": "unavailable",
            "domain": rdap_result.get("domain"),
            "message": "Unable to extract domain information.",
            "indicators": [],
            "dataQualityWarnings": []
        }

    indicators = []
    data_quality_warnings = []

    # Step 3: Calculate domain age.
    registration_date = domain_info.get("registrationDate")

    age_analysis = calculate_domain_age(registration_date)

    if age_analysis["status"] == "completed":

        warning_level = age_analysis["warningLevel"]

        if warning_level != "none":
            indicators.append({
                "type": "domain_age",
                "severity": warning_level,
                "evidence": (
                    f"Domain was registered "
                    f"{age_analysis['ageDays']} days ago."
                ),
                "explanation": (
                    "Recently registered domains may deserve "
                    "additional scrutiny."
                )
            })

    else:
        data_quality_warnings.append(
            "Domain registration date is unavailable or invalid."
        )

    # Step 4: Check domain expiration.
    expiration_date = domain_info.get("expirationDate")

    if expiration_date:
        try:
            expires_at = datetime.fromisoformat(
                expiration_date.replace("Z", "+00:00")
            )

            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)

            expires_at = expires_at.astimezone(timezone.utc)

            if expires_at <= datetime.now(timezone.utc):
                indicators.append({
                    "type": "expired_domain",
                    "severity": "high",
                    "evidence": (
                        f"Domain registration expired on "
                        f"{expiration_date}."
                    ),
                    "explanation": (
                        "The domain's reported registration "
                        "expiration date has passed."
                    )
                })

        except ValueError:
            data_quality_warnings.append(
                "Domain expiration date has an invalid format."
            )

    else:
        data_quality_warnings.append(
            "Domain expiration date is unavailable."
        )

    # Step 5: Check registrar information.
    if not domain_info.get("registrar"):
        data_quality_warnings.append(
            "Registrar information is unavailable."
        )

    # Step 6: Check potentially concerning domain statuses.
    domain_statuses = {
        status.lower().replace(" ", "").replace("-", "")
        for status in domain_info.get("domainStatus", [])
        if isinstance(status, str)
    }

    medium_risk_statuses = {
        "clienthold",
        "serverhold"
    }

    high_risk_statuses = {
        "redemptionperiod",
        "pendingdelete"
    }

    for status in sorted(domain_statuses):

        if status in high_risk_statuses:
            indicators.append({
                "type": "domain_status",
                "severity": "high",
                "evidence": f"Domain status: {status}",
                "explanation": (
                    "This registration status can indicate "
                    "a domain undergoing deletion or recovery."
                )
            })

        elif status in medium_risk_statuses:
            indicators.append({
                "type": "domain_status",
                "severity": "medium",
                "evidence": f"Domain status: {status}",
                "explanation": (
                    "This status indicates that the domain "
                    "may be subject to a registration hold."
                )
            })

    # Step 7: Return the complete assessment.
    return {
        "status": "completed",
        "domain": domain_info["domain"],
        "registrationInfo": domain_info,
        "ageAnalysis": age_analysis,
        "indicators": indicators,
        "dataQualityWarnings": data_quality_warnings,
        "message": "Domain intelligence analysis completed."
    }
