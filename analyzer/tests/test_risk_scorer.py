
import unittest

from services.risk_scorer import (
    calculate_risk_score,
    get_risk_level
)


class TestRiskScorer(unittest.TestCase):

    def test_all_components_available(self):
        result = calculate_risk_score(
            text_score=80,
            url_score=90,
            llm_score=70
        )

        self.assertEqual(result["riskScore"], 78)
        self.assertEqual(result["riskLevel"], "High")

    def test_gemini_unavailable(self):
        result = calculate_risk_score(
            text_score=80,
            url_score=90,
            llm_score=None
        )

        self.assertEqual(result["riskScore"], 87)

    def test_only_text_score_available(self):
        result = calculate_risk_score(
            text_score=60
        )

        self.assertEqual(result["riskScore"], 60)

    def test_no_components_available(self):
        result = calculate_risk_score()

        self.assertIsNone(result["riskScore"])
        self.assertEqual(result["riskLevel"], "Unknown")

    def test_invalid_score_above_100(self):
        with self.assertRaises(ValueError):
            calculate_risk_score(text_score=120)

    def test_invalid_negative_score(self):
        with self.assertRaises(ValueError):
            calculate_risk_score(url_score=-10)

    def test_invalid_string_score(self):
        with self.assertRaises(ValueError):
            calculate_risk_score(llm_score="high")

    def test_risk_level_classification(self):
        self.assertEqual(get_risk_level(20), "Low")
        self.assertEqual(get_risk_level(45), "Medium")
        self.assertEqual(get_risk_level(70), "High")
        self.assertEqual(get_risk_level(90), "Critical")

    def test_boundary_values(self):
        self.assertEqual(get_risk_level(29), "Low")
        self.assertEqual(get_risk_level(30), "Medium")
        self.assertEqual(get_risk_level(59), "Medium")
        self.assertEqual(get_risk_level(60), "High")
        self.assertEqual(get_risk_level(79), "High")
        self.assertEqual(get_risk_level(80), "Critical")


from services.risk_scorer import calculate_text_component_score


def test_text_score_with_multiple_severities():
    text_analysis = {
        "indicators": [
            {"severity": "high"},
            {"severity": "high"},
            {"severity": "medium"}
        ]
    }

    assert calculate_text_component_score(text_analysis) == 75


def test_text_score_with_no_indicators():
    text_analysis = {
        "indicators": []
    }

    assert calculate_text_component_score(text_analysis) == 0


def test_text_score_is_capped_at_100():
    text_analysis = {
        "indicators": [
            {"severity": "high"},
            {"severity": "high"},
            {"severity": "high"},
            {"severity": "high"}
        ]
    }

    assert calculate_text_component_score(text_analysis) == 100


from services.risk_scorer import calculate_url_component_score


def test_url_score_with_shortened_url():
    url_analysis = [
        {
            "status": "analysis_completed",
            "ipAnalysis": {"isIpBased": False},
            "shortenerAnalysis": {"isShortened": True},
            "suspiciousPatterns": {"isSuspicious": False},
            "httpsAnalysis": {"isHttps": True},
            "brandAnalysis": None
        }
    ]

    assert calculate_url_component_score(url_analysis) == 25


def test_url_score_with_multiple_risks():
    url_analysis = [
        {
            "status": "analysis_completed",
            "ipAnalysis": {"isIpBased": True},
            "shortenerAnalysis": {"isShortened": True},
            "suspiciousPatterns": {"isSuspicious": False},
            "httpsAnalysis": {"isHttps": False},
            "brandAnalysis": None
        }
    ]

    assert calculate_url_component_score(url_analysis) == 65


def test_url_score_with_no_urls():
    assert calculate_url_component_score([]) is None


if __name__ == "__main__":
    unittest.main()
