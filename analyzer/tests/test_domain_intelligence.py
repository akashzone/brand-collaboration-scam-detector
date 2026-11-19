
import unittest
from unittest.mock import patch, Mock
from datetime import datetime, timezone, timedelta

from services.domain_intelligence import (
    normalize_domain,
    fetch_domain_rdap,
    extract_domain_info,
    calculate_domain_age,
    analyze_domain_intelligence
)


class TestDomainIntelligence(unittest.TestCase):

    def create_rdap_result(
        self,
        registration_date="2020-01-01T00:00:00Z",
        expiration_date="2030-01-01T00:00:00Z",
        registrar="Example Registrar",
        statuses=None
    ):
        events = []

        if registration_date:
            events.append({
                "eventAction": "registration",
                "eventDate": registration_date
            })

        if expiration_date:
            events.append({
                "eventAction": "expiration",
                "eventDate": expiration_date
            })

        entities = []

        if registrar:
            entities.append({
                "roles": ["registrar"],
                "vcardArray": [
                    "vcard",
                    [["fn", {}, "text", registrar]]
                ]
            })

        return {
            "status": "success",
            "domain": "example.com",
            "data": {
                "events": events,
                "entities": entities,
                "status": statuses or ["active"]
            }
        }

    # --------------------------------
    # Domain normalization tests
    # --------------------------------

    def test_normalize_domain(self):
        result = normalize_domain("NIKE.COM")

        self.assertEqual(result, "nike.com")

    def test_normalize_url(self):
        result = normalize_domain(
            "https://www.nike.com/products"
        )

        self.assertEqual(result, "www.nike.com")

    def test_reject_ip_address(self):
        with self.assertRaises(ValueError):
            normalize_domain("192.168.1.1")

    def test_reject_invalid_domain(self):
        with self.assertRaises(ValueError):
            normalize_domain("invalid_domain")

    # --------------------------------
    # RDAP fetching tests
    # --------------------------------

    @patch("services.domain_intelligence.requests.get")
    def test_successful_rdap_lookup(self, mock_get):

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.ok = True
        mock_response.json.return_value = {
            "ldhName": "example.com"
        }

        mock_get.return_value = mock_response

        result = fetch_domain_rdap("example.com")

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["domain"], "example.com")
        self.assertIn("data", result)

    @patch("services.domain_intelligence.requests.get")
    def test_rdap_domain_not_found(self, mock_get):

        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.ok = False

        mock_get.return_value = mock_response

        result = fetch_domain_rdap("example.com")

        self.assertEqual(result["status"], "not_found")

    @patch("services.domain_intelligence.requests.get")
    def test_rdap_timeout(self, mock_get):

        import requests

        mock_get.side_effect = requests.Timeout()

        result = fetch_domain_rdap("example.com")

        self.assertEqual(result["status"], "unavailable")

    # --------------------------------
    # RDAP extraction tests
    # --------------------------------

    def test_extract_domain_information(self):

        rdap_result = self.create_rdap_result()

        result = extract_domain_info(rdap_result)

        self.assertEqual(result["status"], "completed")
        self.assertEqual(
            result["registrationDate"],
            "2020-01-01T00:00:00Z"
        )
        self.assertEqual(
            result["registrar"],
            "Example Registrar"
        )
        self.assertIn("active", result["domainStatus"])

    def test_extract_information_when_rdap_fails(self):

        rdap_result = {
            "status": "unavailable",
            "domain": "example.com",
            "message": "RDAP service unavailable."
        }

        result = extract_domain_info(rdap_result)

        self.assertEqual(result["status"], "unavailable")

    # --------------------------------
    # Domain age tests
    # --------------------------------

    def test_new_domain_has_high_warning(self):

        registration_date = (
            datetime.now(timezone.utc) - timedelta(days=3)
        ).isoformat()

        result = calculate_domain_age(registration_date)

        self.assertEqual(result["status"], "completed")
        self.assertEqual(result["ageDays"], 3)
        self.assertEqual(result["warningLevel"], "high")

    def test_old_domain_has_no_warning(self):

        result = calculate_domain_age(
            "2020-01-01T00:00:00Z"
        )

        self.assertEqual(result["warningLevel"], "none")

    def test_missing_registration_date(self):

        result = calculate_domain_age(None)

        self.assertEqual(result["status"], "unavailable")
        self.assertEqual(result["warningLevel"], "unknown")

    def test_future_registration_date(self):

        future_date = (
            datetime.now(timezone.utc) + timedelta(days=10)
        ).isoformat()

        result = calculate_domain_age(future_date)

        self.assertEqual(result["status"], "unavailable")

    # --------------------------------
    # Complete domain analysis tests
    # --------------------------------

    @patch("services.domain_intelligence.fetch_domain_rdap")
    def test_new_domain_analysis(self, mock_fetch):

        registration_date = (
            datetime.now(timezone.utc) - timedelta(days=5)
        ).isoformat()

        mock_fetch.return_value = self.create_rdap_result(
            registration_date=registration_date,
            statuses=["clientHold"]
        )

        result = analyze_domain_intelligence("example.com")

        self.assertEqual(result["status"], "completed")

        self.assertTrue(
            any(
                indicator["type"] == "domain_age"
                for indicator in result["indicators"]
            )
        )

        self.assertTrue(
            any(
                indicator["type"] == "domain_status"
                for indicator in result["indicators"]
            )
        )

    @patch("services.domain_intelligence.fetch_domain_rdap")
    def test_expired_domain_analysis(self, mock_fetch):

        mock_fetch.return_value = self.create_rdap_result(
            registration_date="2020-01-01T00:00:00Z",
            expiration_date="2000-01-01T00:00:00Z",
            registrar=None,
            statuses=["pendingDelete"]
        )

        result = analyze_domain_intelligence("example.com")

        self.assertEqual(result["status"], "completed")

        self.assertTrue(
            any(
                indicator["type"] == "expired_domain"
                for indicator in result["indicators"]
            )
        )

        self.assertTrue(
            any(
                indicator["type"] == "domain_status"
                and indicator["severity"] == "high"
                for indicator in result["indicators"]
            )
        )

        self.assertTrue(
            any(
                "Registrar information" in warning
                for warning in result["dataQualityWarnings"]
            )
        )

    @patch("services.domain_intelligence.fetch_domain_rdap")
    def test_missing_registration_information(self, mock_fetch):

        mock_fetch.return_value = self.create_rdap_result(
            registration_date=None
        )

        result = analyze_domain_intelligence("example.com")

        self.assertEqual(result["status"], "completed")

        self.assertEqual(
            result["ageAnalysis"]["warningLevel"],
            "unknown"
        )

        self.assertTrue(
            any(
                "registration date" in warning.lower()
                for warning in result["dataQualityWarnings"]
            )
        )

    @patch("services.domain_intelligence.fetch_domain_rdap")
    def test_rdap_unavailable_during_analysis(self, mock_fetch):

        mock_fetch.return_value = {
            "status": "unavailable",
            "domain": "example.com",
            "message": "RDAP service unavailable."
        }

        result = analyze_domain_intelligence("example.com")

        self.assertEqual(result["status"], "unavailable")
        self.assertEqual(result["indicators"], [])


if __name__ == "__main__":
    unittest.main()
