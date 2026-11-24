
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
            llm_score=70,
            rdap_score=70
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
    def test_final_score_never_exceeds_100(self):
        result = calculate_risk_score(
            text_score=100,
            url_score=100,
            llm_score=100
        )
        assert result["riskScore"] == 100
        assert 0 <= result["riskScore"] <= 100


    def test_final_score_never_goes_below_zero(self):
        result = calculate_risk_score(
            text_score=0,
            url_score=0,
            llm_score=0
        )
        assert result["riskScore"] == 0
        assert 0 <= result["riskScore"] <= 100


    def test_risk_classification_matches_final_score(self):
        result = calculate_risk_score(
            text_score=80,
            url_score=90,
            llm_score=70,
            rdap_score=70
        )
        assert result["riskScore"] == 78
        assert result["riskLevel"] == get_risk_level(
            result["riskScore"]
        )


    def test_missing_url_component_normalizes_weights(self):
        result = calculate_risk_score(
            text_score=80,
            url_score=None,
            llm_score=60
        )
        assert result["riskScore"] == 65
        assert "url" not in result["componentScores"]


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


def test_url_score_when_all_analyses_fail():
    url_analysis = [
        {"status": "analysis_failed"},
        {"status": "analysis_failed"}
    ]

    assert calculate_url_component_score(url_analysis) is None


def test_url_score_when_some_analyses_fail():
    url_analysis = [
        {"status": "analysis_failed"},
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



def test_multiple_urls_use_highest_score():
    url_analysis = [
        {
            "status": "analysis_completed",
            "ipAnalysis": {"isIpBased": False},
            "shortenerAnalysis": {"isShortened": True},
            "suspiciousPatterns": {"isSuspicious": False},
            "httpsAnalysis": {"isHttps": True},
            "brandAnalysis": None
        },
        {
            "status": "analysis_completed",
            "ipAnalysis": {"isIpBased": True},
            "shortenerAnalysis": {"isShortened": False},
            "suspiciousPatterns": {"isSuspicious": False},
            "httpsAnalysis": {"isHttps": True},
            "brandAnalysis": None
        }
    ]

    assert calculate_url_component_score(url_analysis) == 30


def test_multiple_urls_do_not_accumulate_scores():
    url_analysis = [
        {
            "status": "analysis_completed",
            "ipAnalysis": {"isIpBased": False},
            "shortenerAnalysis": {"isShortened": True},
            "suspiciousPatterns": {"isSuspicious": False},
            "httpsAnalysis": {"isHttps": True},
            "brandAnalysis": None
        },
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


def test_single_url_with_multiple_risks():
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


def test_url_score_with_malformed_result():
    url_analysis = [
        None,
        "invalid result",
        {"status": "analysis_failed"}
    ]

    assert calculate_url_component_score(url_analysis) is None


def test_url_score_with_missing_analysis_section():
    url_analysis = [
        {
            "status": "analysis_completed",
            "ipAnalysis": {"isIpBased": False},
            "shortenerAnalysis": {"isShortened": True},
            # suspiciousPatterns is missing
            "httpsAnalysis": {"isHttps": True},
            "brandAnalysis": None
        }
    ]

    assert calculate_url_component_score(url_analysis) is None


def test_url_score_with_invalid_indicator_type():
    url_analysis = [
        {
            "status": "analysis_completed",
            "ipAnalysis": {"isIpBased": "false"},
            "shortenerAnalysis": {"isShortened": False},
            "suspiciousPatterns": {"isSuspicious": False},
            "httpsAnalysis": {"isHttps": True},
            "brandAnalysis": None
        }
    ]

    assert calculate_url_component_score(url_analysis) is None


def test_url_score_skips_invalid_results_and_uses_valid_result():
    url_analysis = [
        {
            "status": "analysis_completed",
            "ipAnalysis": None,
            "shortenerAnalysis": {"isShortened": True},
            "suspiciousPatterns": {"isSuspicious": False},
            "httpsAnalysis": {"isHttps": True},
            "brandAnalysis": None
        },
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


from services.risk_scorer import calculate_domain_component_score


class TestDomainComponentScore(unittest.TestCase):

    def test_newly_registered_under_30_days(self):
        # 1. Newly registered domain under 30 days -> 30 points
        domain_analysis = [{
            "status": "completed",
            "domain": "newscam.com",
            "ageAnalysis": {"status": "completed", "ageDays": 15},
            "indicators": [],
            "registrationInfo": {"domainStatus": []}
        }]
        self.assertEqual(calculate_domain_component_score(domain_analysis), 30)

    def test_domain_registered_30_to_89_days(self):
        # 2. Domain registered between 30 and 89 days -> 20 points
        domain_analysis = [{
            "status": "completed",
            "domain": "recent.com",
            "ageAnalysis": {"status": "completed", "ageDays": 45},
            "indicators": [],
            "registrationInfo": {"domainStatus": []}
        }]
        self.assertEqual(calculate_domain_component_score(domain_analysis), 20)

    def test_domain_registered_90_to_364_days(self):
        # 3. Domain registered between 90 and 364 days -> 10 points
        domain_analysis = [{
            "status": "completed",
            "domain": "established.com",
            "ageAnalysis": {"status": "completed", "ageDays": 200},
            "indicators": [],
            "registrationInfo": {"domainStatus": []}
        }]
        self.assertEqual(calculate_domain_component_score(domain_analysis), 10)

    def test_domain_older_than_365_days(self):
        # 4. Domain older than 365 days -> 0 points
        domain_analysis = [{
            "status": "completed",
            "domain": "oldbrand.com",
            "ageAnalysis": {"status": "completed", "ageDays": 500},
            "indicators": [],
            "registrationInfo": {"domainStatus": []}
        }]
        self.assertEqual(calculate_domain_component_score(domain_analysis), 0)

    def test_expired_domain(self):
        # 5. Expired domain -> 40 points
        domain_analysis = [{
            "status": "completed",
            "domain": "expiredbrand.com",
            "ageAnalysis": {"status": "completed", "ageDays": 400},
            "indicators": [{"type": "expired_domain", "severity": "high"}],
            "registrationInfo": {"domainStatus": []}
        }]
        self.assertEqual(calculate_domain_component_score(domain_analysis), 40)

    def test_domain_with_client_hold(self):
        # 6. Domain with clientHold -> 30 points
        domain_analysis = [{
            "status": "completed",
            "domain": "held.com",
            "ageAnalysis": {"status": "completed", "ageDays": 500},
            "indicators": [],
            "registrationInfo": {"domainStatus": ["clientHold"]}
        }]
        self.assertEqual(calculate_domain_component_score(domain_analysis), 30)

    def test_domain_with_server_hold(self):
        # 7. Domain with serverHold -> 30 points
        domain_analysis = [{
            "status": "completed",
            "domain": "serverheld.com",
            "ageAnalysis": {"status": "completed", "ageDays": 500},
            "indicators": [],
            "registrationInfo": {"domainStatus": ["serverHold"]}
        }]
        self.assertEqual(calculate_domain_component_score(domain_analysis), 30)

    def test_domain_with_redemption_period(self):
        # 8. Domain with redemptionPeriod -> 40 points
        domain_analysis = [{
            "status": "completed",
            "domain": "redemption.com",
            "ageAnalysis": {"status": "completed", "ageDays": 500},
            "indicators": [],
            "registrationInfo": {"domainStatus": ["redemptionPeriod"]}
        }]
        self.assertEqual(calculate_domain_component_score(domain_analysis), 40)

    def test_domain_with_pending_delete(self):
        # 9. Domain with pendingDelete -> 40 points
        domain_analysis = [{
            "status": "completed",
            "domain": "pendingdel.com",
            "ageAnalysis": {"status": "completed", "ageDays": 500},
            "indicators": [],
            "registrationInfo": {"domainStatus": ["pendingDelete"]}
        }]
        self.assertEqual(calculate_domain_component_score(domain_analysis), 40)

    def test_multiple_domains_highest_selected(self):
        # 10. Multiple domains where the highest score is selected
        domain_analysis = [
            {
                "status": "completed",
                "domain": "safe.com",
                "ageAnalysis": {"status": "completed", "ageDays": 1000},
                "indicators": [],
                "registrationInfo": {"domainStatus": []}
            },
            {
                "status": "completed",
                "domain": "shady.com",
                "ageAnalysis": {"status": "completed", "ageDays": 10},  # 30
                "indicators": [],
                "registrationInfo": {"domainStatus": ["clientHold"]}  # 30 -> 60
            },
            {
                "status": "completed",
                "domain": "mild.com",
                "ageAnalysis": {"status": "completed", "ageDays": 50},  # 20
                "indicators": [],
                "registrationInfo": {"domainStatus": []}
            }
        ]
        self.assertEqual(calculate_domain_component_score(domain_analysis), 60)

    def test_domain_not_found(self):
        # 11. Domain not found
        domain_analysis = [{
            "status": "not_found",
            "domain": "nonexistent.com",
            "message": "No RDAP registration record was found."
        }]
        self.assertIsNone(calculate_domain_component_score(domain_analysis))

    def test_invalid_domain(self):
        # 12. Invalid domain
        domain_analysis = [{
            "status": "invalid_domain",
            "domain": None,
            "message": "Invalid domain name."
        }]
        self.assertIsNone(calculate_domain_component_score(domain_analysis))

    def test_rdap_unavailable(self):
        # 13. RDAP unavailable
        domain_analysis = [{
            "status": "unavailable",
            "domain": "error.com",
            "message": "RDAP request timed out."
        }]
        self.assertIsNone(calculate_domain_component_score(domain_analysis))

    def test_rdap_rate_limited(self):
        # 14. RDAP rate limited
        domain_analysis = [{
            "status": "rate_limited",
            "domain": "busy.com",
            "message": "RDAP service rate limit reached."
        }]
        self.assertIsNone(calculate_domain_component_score(domain_analysis))

    def test_missing_registration_info(self):
        # 15. Missing registration information (score 0, not treated as suspicious)
        domain_analysis = [{
            "status": "completed",
            "domain": "hiddenwhois.com",
            "ageAnalysis": {"status": "unavailable", "ageDays": None},
            "indicators": [],
            "registrationInfo": {}
        }]
        self.assertEqual(calculate_domain_component_score(domain_analysis), 0)

    def test_malformed_domain_analysis_data(self):
        # 16. Malformed domain-analysis data
        self.assertIsNone(calculate_domain_component_score(None))
        self.assertIsNone(calculate_domain_component_score([]))
        self.assertIsNone(calculate_domain_component_score(["invalid"]))
        self.assertIsNone(calculate_domain_component_score([{"status": "unknown"}]))

    def test_rdap_component_unavailable_during_final_scoring(self):
        # 17. RDAP component unavailable during final scoring (redistributes weights)
        result = calculate_risk_score(
            text_score=80,
            url_score=90,
            llm_score=70,
            rdap_score=None
        )
        # Weights: text 0.15, url 0.30, llm 0.40 -> sum = 0.85
        # (80*0.15 + 90*0.30 + 70*0.40) / 0.85 = 67 / 0.85 = 78.82 -> 79
        self.assertEqual(result["riskScore"], 79)
        self.assertNotIn("rdap", result["componentScores"])

    def test_rdap_component_available_with_score_zero(self):
        # 18. RDAP component available with a score of zero
        result = calculate_risk_score(
            text_score=80,
            url_score=90,
            llm_score=70,
            rdap_score=0
        )
        # Weights: text 0.15, url 0.30, llm 0.40, rdap 0.15 -> sum = 1.0
        # 80*0.15 + 90*0.30 + 70*0.40 + 0*0.15 = 12 + 27 + 28 + 0 = 67
        self.assertEqual(result["riskScore"], 67)
        self.assertEqual(result["componentScores"]["rdap"], 0)

    def test_all_four_components_available(self):
        # 19. All four components available: Formula verified
        # R = (T * 0.15) + (U * 0.30) + (L * 0.40) + (D * 0.15)
        # 60*0.15 + 70*0.30 + 85*0.40 + 40*0.15 = 9 + 21 + 34 + 6 = 70
        result = calculate_risk_score(
            text_score=60,
            url_score=70,
            llm_score=85,
            rdap_score=40
        )
        self.assertEqual(result["riskScore"], 70)
        self.assertEqual(result["riskLevel"], "High")
        self.assertEqual(result["classification"], "Potential Scam")
        self.assertEqual(result["componentScores"], {
            "text": 60,
            "url": 70,
            "llm": 85,
            "rdap": 40
        })

    def test_all_components_unavailable(self):
        # 20. All components unavailable
        result = calculate_risk_score(
            text_score=None,
            url_score=None,
            llm_score=None,
            rdap_score=None
        )
        self.assertIsNone(result["riskScore"])
        self.assertEqual(result["riskLevel"], "Unknown")
        self.assertEqual(result["classification"], "Insufficient Data")
        self.assertEqual(result["componentScores"], {})


if __name__ == "__main__":
    unittest.main()
