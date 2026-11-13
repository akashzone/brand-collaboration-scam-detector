
import os
import json
import unittest

from types import SimpleNamespace
from unittest.mock import patch

from services.llm_analyzer import analyze_message_with_llm


class TestLLMAnalyzer(unittest.TestCase):

    def setUp(self):
        self.valid_response = {
            "scam_likelihood": "high",
            "risk_score": 90,
            "summary": "The message requests a suspicious security deposit.",
            "indicators": [
                {
                    "category": "financial_fraud",
                    "evidence": "Pay a refundable security deposit",
                    "explanation": "Advance payment requests are suspicious."
                }
            ],
            "recommended_actions": [
                "Do not make the payment.",
                "Verify the brand through its official website."
            ]
        }

        self.environment = patch.dict(
            os.environ,
            {
                "GEMINI_API_KEY": "test-api-key",
                "GEMINI_MODEL": "gemini-3.6-flash"
            }
        )
        self.environment.start()

    def tearDown(self):
        self.environment.stop()

    @patch("services.llm_analyzer.genai.Client")
    def test_successful_llm_analysis(self, mock_client):

        mock_client.return_value.models.generate_content.return_value = (
            SimpleNamespace(
                text=json.dumps(self.valid_response)
            )
        )

        result = analyze_message_with_llm(
            "Pay a refundable security deposit."
        )

        self.assertEqual(result["scam_likelihood"], "high")
        self.assertEqual(result["risk_score"], 90)
        self.assertEqual(len(result["indicators"]), 1)

    def test_missing_api_key(self):

        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(
                RuntimeError,
                "Gemini API key is not configured"
            ):
                analyze_message_with_llm("Test message")

    @patch("services.llm_analyzer.genai.Client")
    def test_empty_llm_response(self, mock_client):

        mock_client.return_value.models.generate_content.return_value = (
            SimpleNamespace(text=None)
        )

        with self.assertRaisesRegex(
            RuntimeError,
            "LLM analysis failed"
        ):
            analyze_message_with_llm("Test message")

    @patch("services.llm_analyzer.genai.Client")
    def test_invalid_json_response(self, mock_client):

        mock_client.return_value.models.generate_content.return_value = (
            SimpleNamespace(text="This is not valid JSON")
        )

        with self.assertRaisesRegex(
            RuntimeError,
            "LLM analysis failed"
        ):
            analyze_message_with_llm("Test message")

    @patch("services.llm_analyzer.genai.Client")
    def test_gemini_api_failure(self, mock_client):

        mock_client.return_value.models.generate_content.side_effect = (
            Exception("Gemini service unavailable")
        )

        with self.assertRaisesRegex(
            RuntimeError,
            "LLM analysis failed"
        ):
            analyze_message_with_llm("Test message")


if __name__ == "__main__":
    unittest.main()
