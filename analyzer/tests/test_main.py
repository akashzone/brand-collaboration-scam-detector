
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
    
    @patch("main.analyze_message_with_llm")
    @patch("main.analyze_domain_intelligence")
    @patch("main.analyze_url")
    @patch("main.generate_text_summary")
    @patch("main.analyze_text")
    def test_domain_analysis_success(
        self,
        mock_analyze_text,
        mock_generate_summary,
        mock_analyze_url,
        mock_domain_analysis,
        mock_analyze_llm
    ):
        mock_analyze_text.return_value = self.get_text_analysis(
            ["https://www.nike.com/products"]
        )

        mock_generate_summary.return_value = {
            "classification": "Low"
        }

        mock_analyze_url.return_value = self.get_url_analysis()

        mock_domain_analysis.return_value = {
            "status": "completed",
            "domain": "nike.com",
            "ageAnalysis": {
                "ageDays": 2500,
                "warningLevel": "none"
            },
            "indicators": []
        }

        mock_analyze_llm.return_value = {"risk_score": 20}

        response = self.client.post(
            "/analyze",
            json={"message": "Visit https://www.nike.com/products"}
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()["data"]

        self.assertEqual(len(data["domainAnalysis"]), 1)
        self.assertEqual(
            data["domainAnalysis"][0]["domain"],
            "nike.com"
        )

        mock_domain_analysis.assert_called_once_with("nike.com")
    
    @patch("main.analyze_message_with_llm")
    @patch("main.analyze_domain_intelligence")
    @patch("main.analyze_url")
    @patch("main.generate_text_summary")
    @patch("main.analyze_text")
    def test_duplicate_domains_only_analyzed_once(
        self,
        mock_analyze_text,
        mock_generate_summary,
        mock_analyze_url,
        mock_domain_analysis,
        mock_analyze_llm
    ):
        urls = [
            "https://www.nike.com/products",
            "https://nike.com/offers",
            "https://www.nike.com/contact"
        ]

        mock_analyze_text.return_value = self.get_text_analysis(urls)
        mock_generate_summary.return_value = {"classification": "Low"}
        mock_analyze_url.return_value = self.get_url_analysis()
        mock_domain_analysis.return_value = {
            "status": "completed",
            "domain": "nike.com",
            "indicators": []
        }
        mock_analyze_llm.return_value = {"risk_score": 20}

        response = self.client.post(
            "/analyze",
            json={"message": "Check these Nike links"}
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()["data"]

        # All three URLs should be analyzed.
        self.assertEqual(len(data["urlAnalysis"]), 3)

        # Only one unique domain should be analyzed.
        self.assertEqual(len(data["domainAnalysis"]), 1)

        mock_analyze_url.assert_called()
        self.assertEqual(mock_analyze_url.call_count, 3)

        mock_domain_analysis.assert_called_once_with("nike.com")
    

    @patch("main.analyze_message_with_llm")
    @patch("main.analyze_domain_intelligence")
    @patch("main.analyze_url")
    @patch("main.generate_text_summary")
    @patch("main.analyze_text")
    def test_multiple_unique_domains(
        self,
        mock_analyze_text,
        mock_generate_summary,
        mock_analyze_url,
        mock_domain_analysis,
        mock_analyze_llm
    ):
        urls = [
            "https://nike.com",
            "https://adidas.com",
            "https://puma.com"
        ]

        mock_analyze_text.return_value = self.get_text_analysis(urls)
        mock_generate_summary.return_value = {"classification": "Medium"}
        mock_analyze_url.return_value = self.get_url_analysis()

        mock_domain_analysis.side_effect = [
            {"status": "completed", "domain": "nike.com", "indicators": []},
            {"status": "completed", "domain": "adidas.com", "indicators": []},
            {"status": "completed", "domain": "puma.com", "indicators": []}
        ]

        mock_analyze_llm.return_value = {"risk_score": 40}

        response = self.client.post(
            "/analyze",
            json={"message": "Check these brand websites"}
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()["data"]

        self.assertEqual(len(data["urlAnalysis"]), 3)
        self.assertEqual(len(data["domainAnalysis"]), 3)

        self.assertEqual(mock_domain_analysis.call_count, 3)

        analyzed_domains = {
            call.args[0]
            for call in mock_domain_analysis.call_args_list
        }

        self.assertEqual(
            analyzed_domains,
            {"nike.com", "adidas.com", "puma.com"}
        )

    @patch("main.analyze_message_with_llm")
    @patch("main.analyze_domain_intelligence")
    @patch("main.analyze_url")
    @patch("main.generate_text_summary")
    @patch("main.analyze_text")
    def test_domain_analysis_unavailable(
        self,
        mock_analyze_text,
        mock_generate_summary,
        mock_analyze_url,
        mock_domain_analysis,
        mock_analyze_llm
    ):
        mock_analyze_text.return_value = self.get_text_analysis(
            ["https://nike.com"]
        )

        mock_generate_summary.return_value = {"classification": "Medium"}
        mock_analyze_url.return_value = self.get_url_analysis()

        mock_domain_analysis.return_value = {
            "status": "unavailable",
            "domain": "nike.com",
            "message": "RDAP service is temporarily unavailable.",
            "indicators": [],
            "dataQualityWarnings": []
        }

        mock_analyze_llm.return_value = {"risk_score": 40}

        response = self.client.post(
            "/analyze",
            json={"message": "Check this Nike collaboration offer"}
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()["data"]

        self.assertEqual(len(data["domainAnalysis"]), 1)

        self.assertEqual(
            data["domainAnalysis"][0]["status"],
            "unavailable"
        )

        self.assertEqual(data["llmAnalysis"]["status"], "completed")

        self.assertIsNotNone(data["riskAssessment"]["riskScore"])
    
    @patch("main.analyze_message_with_llm")
    @patch("main.analyze_domain_intelligence")
    @patch("main.analyze_url")
    @patch("main.generate_text_summary")
    @patch("main.analyze_text")
    def test_message_without_urls_has_empty_domain_analysis(
        self,
        mock_analyze_text,
        mock_generate_summary,
        mock_analyze_url,
        mock_domain_analysis,
        mock_analyze_llm
    ):
        mock_analyze_text.return_value = self.get_text_analysis()
        mock_generate_summary.return_value = {"classification": "Low"}
        mock_analyze_llm.return_value = {"risk_score": 20}

        response = self.client.post(
            "/analyze",
            json={
                "message": "Hello! We are interested in collaborating with you."
            }
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()["data"]

        self.assertEqual(data["urlAnalysis"], [])
        self.assertEqual(data["domainAnalysis"], [])

        mock_analyze_url.assert_not_called()
        mock_domain_analysis.assert_not_called()

        self.assertIsNotNone(data["riskAssessment"]["riskScore"])





if __name__ == "__main__":
    unittest.main()
