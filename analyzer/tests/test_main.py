
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app


class TestAnalyzeEndpoint(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def get_text_analysis(self, urls=None):
        return {
            "indicators": [
                {"severity": "high"},
                {"severity": "medium"}
            ],
            "entities": {
                "urls": urls or [],
                "emailAddresses": []
            }
        }

    def get_url_analysis(self, shortened=False):
        return {
            "status": "analysis_completed",
            "ipAnalysis": {"isIpBased": False},
            "shortenerAnalysis": {"isShortened": shortened},
            "suspiciousPatterns": {"isSuspicious": False},
            "httpsAnalysis": {"isHttps": True},
            "brandAnalysis": None
        }

    @patch("main.analyze_message_with_llm")
    @patch("main.analyze_url")
    @patch("main.generate_text_summary")
    @patch("main.analyze_text")
    def test_all_components_available(
        self,
        mock_analyze_text,
        mock_generate_summary,
        mock_analyze_url,
        mock_analyze_llm
    ):
        mock_analyze_text.return_value = self.get_text_analysis(
            ["https://bit.ly/campaign"]
        )
        mock_generate_summary.return_value = {"classification": "High"}
        mock_analyze_url.return_value = self.get_url_analysis(
            shortened=True
        )
        mock_analyze_llm.return_value = {"risk_score": 80}

        response = self.client.post(
            "/analyze",
            json={"message": "Suspicious brand collaboration offer"}
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()["data"]

        self.assertEqual(data["llmAnalysis"]["status"], "completed")
        self.assertEqual(len(data["urlAnalysis"]), 1)
        self.assertIsNotNone(data["riskAssessment"]["riskScore"])

    @patch("main.analyze_message_with_llm")
    @patch("main.analyze_url")
    @patch("main.generate_text_summary")
    @patch("main.analyze_text")
    def test_llm_unavailable(
        self,
        mock_analyze_text,
        mock_generate_summary,
        mock_analyze_url,
        mock_analyze_llm
    ):
        mock_analyze_text.return_value = self.get_text_analysis(
            ["https://bit.ly/campaign"]
        )
        mock_generate_summary.return_value = {"classification": "High"}
        mock_analyze_url.return_value = self.get_url_analysis()
        mock_analyze_llm.side_effect = RuntimeError(
            "Gemini API unavailable"
        )

        response = self.client.post(
            "/analyze",
            json={"message": "Check this collaboration offer"}
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()["data"]

        self.assertEqual(data["llmAnalysis"]["status"], "unavailable")
        self.assertIsNotNone(data["riskAssessment"]["riskScore"])

    @patch("main.analyze_message_with_llm")
    @patch("main.analyze_url")
    @patch("main.generate_text_summary")
    @patch("main.analyze_text")
    def test_message_without_urls(
        self,
        mock_analyze_text,
        mock_generate_summary,
        mock_analyze_url,
        mock_analyze_llm
    ):
        mock_analyze_text.return_value = self.get_text_analysis()
        mock_generate_summary.return_value = {"classification": "Medium"}
        mock_analyze_llm.return_value = {"risk_score": 40}

        response = self.client.post(
            "/analyze",
            json={"message": "We would like to collaborate with you"}
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()["data"]

        self.assertEqual(data["urlAnalysis"], [])
        mock_analyze_url.assert_not_called()
        self.assertIsNotNone(data["riskAssessment"]["riskScore"])

    @patch("main.analyze_message_with_llm")
    @patch("main.analyze_url")
    @patch("main.generate_text_summary")
    @patch("main.analyze_text")
    def test_multiple_urls(
        self,
        mock_analyze_text,
        mock_generate_summary,
        mock_analyze_url,
        mock_analyze_llm
    ):
        urls = [
            "https://bit.ly/campaign",
            "http://example.com/offer"
        ]

        mock_analyze_text.return_value = self.get_text_analysis(urls)
        mock_generate_summary.return_value = {"classification": "High"}
        mock_analyze_url.side_effect = [
            self.get_url_analysis(shortened=True),
            self.get_url_analysis(shortened=False)
        ]
        mock_analyze_llm.return_value = {"risk_score": 70}

        response = self.client.post(
            "/analyze",
            json={"message": "Visit these collaboration links"}
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()["data"]

        self.assertEqual(len(data["urlAnalysis"]), 2)
        self.assertEqual(mock_analyze_url.call_count, 2)
        self.assertIsNotNone(data["riskAssessment"]["riskScore"])


if __name__ == "__main__":
    unittest.main()
