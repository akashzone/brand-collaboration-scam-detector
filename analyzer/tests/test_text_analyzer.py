
import unittest

from services.text_analyzer import analyze_text


class TestTextAnalyzer(unittest.TestCase):

    def test_urgency_detection(self):
        result = analyze_text(
            "Act now! This offer expires today."
        )

        self.assertGreater(result["indicatorCount"], 0)
        self.assertEqual(
            result["indicators"][0]["id"],
            "urgency_language"
        )

    def test_upfront_payment_detection(self):
        result = analyze_text(
            "Please pay a registration fee to proceed."
        )

        self.assertIn(
            "upfront_payment",
            [item["id"] for item in result["indicators"]]
        )

    def test_credential_request_detection(self):
        result = analyze_text(
            "Please share your OTP for verification."
        )

        self.assertIn(
            "credential_request",
            [item["id"] for item in result["indicators"]]
        )

    def test_off_platform_contact_detection(self):
        result = analyze_text(
            "Contact us on WhatsApp for further details."
        )

        self.assertIn(
            "off_platform_contact",
            [item["id"] for item in result["indicators"]]
        )

    def test_case_insensitive_detection(self):
        result = analyze_text(
            "PLEASE SHARE YOUR PASSWORD."
        )

        self.assertIn(
            "credential_request",
            [item["id"] for item in result["indicators"]]
        )

    def test_normal_message_has_no_indicators(self):
        result = analyze_text(
            "Hello! We would love to collaborate with you "
            "on our upcoming campaign."
        )

        self.assertEqual(result["indicatorCount"], 0)
        self.assertEqual(result["indicators"], [])

    def test_multiple_indicators(self):
        result = analyze_text(
            "Act now! Pay a registration fee and share your OTP."
        )

        self.assertGreaterEqual(result["indicatorCount"], 3)
    
    def test_multiple_matches_for_same_rule(self):
        result = analyze_text(
            "Act now! This offer expires today! "
            "Respond immediately."
        )

        urgency_indicator = next(
            item for item in result["indicators"]
            if item["id"] == "urgency_language"
        )
        print("Detected urgency evidence:", urgency_indicator["evidence"])
        self.assertEqual(
            len(urgency_indicator["evidence"]),
            3
        )

if __name__ == "__main__":
    unittest.main()
