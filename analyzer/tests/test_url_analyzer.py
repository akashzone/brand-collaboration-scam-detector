
import unittest

from services.url_analyzer import (
    normalize_url,
    detect_ip_based_url,
    detect_url_shortener,
    detect_suspicious_url_patterns,
    analyze_https,
    detect_brand_impersonation,
    analyze_url
)

class TestURLAnalyzer(unittest.TestCase):

    def test_normalize_uppercase_url(self):
        result = normalize_url("HTTPS://WWW.NIKE.COM")

        self.assertEqual(
            result,
            "https://www.nike.com"
        )

    def test_add_https_to_url_without_scheme(self):
        result = normalize_url("www.nike.com")

        self.assertEqual(
            result,
            "https://www.nike.com"
        )

    def test_preserve_url_path(self):
        result = normalize_url(
            "https://www.nike.com/Products"
        )

        self.assertEqual(
            result,
            "https://www.nike.com/Products"
        )

    def test_remove_trailing_punctuation(self):
        result = normalize_url(
            "https://www.nike.com."
        )

        self.assertEqual(
            result,
            "https://www.nike.com"
        )

    def test_reject_unsupported_scheme(self):
        result = normalize_url(
            "javascript:alert(1)"
        )

        self.assertIsNone(result)

    def test_reject_empty_url(self):
        result = normalize_url("")

        self.assertIsNone(result)

    def test_reject_embedded_credentials(self):
        result = normalize_url(
            "https://nike.com@attacker.com"
        )

        self.assertIsNone(result)


    def test_detect_ipv4_url(self):
        result = detect_ip_based_url(
            "http://192.168.1.100/login"
        )

        self.assertTrue(result["isIpBased"])
        self.assertEqual(result["ipAddress"], "192.168.1.100")
        self.assertEqual(result["ipVersion"], 4)


    def test_detect_ipv6_url(self):
        result = detect_ip_based_url(
            "http://[2001:db8::1]/login"
        )

        self.assertTrue(result["isIpBased"])
        self.assertEqual(result["ipVersion"], 6)


    def test_regular_domain_is_not_ip(self):
        result = detect_ip_based_url(
            "https://www.nike.com"
        )

        self.assertFalse(result["isIpBased"])
        self.assertIsNone(result["ipAddress"])


    def test_invalid_ip_like_hostname(self):
        result = detect_ip_based_url(
            "http://999.999.999.999/login"
        )

        self.assertFalse(result["isIpBased"])


    def test_ip_detection_with_port(self):
        result = detect_ip_based_url(
            "http://192.168.1.100:8080/login"
        )

        self.assertTrue(result["isIpBased"])
        self.assertEqual(result["ipVersion"], 4)
    
    def test_detect_bitly_shortener(self):
        result = detect_url_shortener(
            "https://bit.ly/abc123"
        )

        self.assertTrue(result["isShortened"])
        self.assertEqual(
            result["shortenerDomain"],
            "bit.ly"
        )


    def test_detect_tinyurl_shortener(self):
        result = detect_url_shortener(
            "https://tinyurl.com/example"
        )

        self.assertTrue(result["isShortened"])
        self.assertEqual(
            result["shortenerDomain"],
            "tinyurl.com"
        )


    def test_detect_shortener_with_www(self):
        result = detect_url_shortener(
            "https://www.bit.ly/abc123"
        )

        self.assertTrue(result["isShortened"])


    def test_regular_domain_is_not_shortener(self):
        result = detect_url_shortener(
            "https://www.nike.com"
        )

        self.assertFalse(result["isShortened"])
        self.assertIsNone(result["shortenerDomain"])


    def test_invalid_url_is_not_shortener(self):
        result = detect_url_shortener(
            "javascript:alert(1)"
        )

        self.assertFalse(result["isShortened"])
        self.assertIsNone(result["shortenerDomain"])


    def test_detect_suspicious_keywords(self):
        result = detect_suspicious_url_patterns(
            "https://nike-login-example.com"
        )

        self.assertTrue(result["isSuspicious"])

        self.assertIn(
            "suspicious_keywords",
            [item["type"] for item in result["findings"]]
        )


    def test_detect_excessive_subdomains(self):
        result = detect_suspicious_url_patterns(
            "https://login.verify.account.secure.example.com"
        )

        self.assertTrue(result["isSuspicious"])

        self.assertIn(
            "excessive_subdomains",
            [item["type"] for item in result["findings"]]
        )


    def test_regular_url_has_no_suspicious_patterns(self):
        result = detect_suspicious_url_patterns(
            "https://www.nike.com/products"
        )

        self.assertFalse(result["isSuspicious"])
        self.assertEqual(result["findings"], [])


    def test_suspicious_keyword_in_path_is_not_hostname_match(self):
        result = detect_suspicious_url_patterns(
            "https://example.com/login"
        )

        self.assertFalse(
            any(
                item["type"] == "suspicious_keywords"
                for item in result["findings"]
            )
        )


    def test_invalid_url_returns_no_findings(self):
        result = detect_suspicious_url_patterns(
            "javascript:alert(1)"
        )

        self.assertFalse(result["isSuspicious"])
        self.assertEqual(result["findings"], [])

        
    def test_https_url(self):
        result = analyze_https(
            "https://www.nike.com"
        )

        self.assertTrue(result["isHttps"])
        self.assertEqual(result["protocol"], "https")
        self.assertIsNone(result["finding"])


    def test_http_url(self):
        result = analyze_https(
            "http://www.nike.com"
        )

        self.assertFalse(result["isHttps"])
        self.assertEqual(result["protocol"], "http")
        self.assertEqual(result["finding"], "insecure_http")


    def test_url_without_protocol_defaults_to_https(self):
        result = analyze_https(
            "www.nike.com"
        )

        self.assertTrue(result["isHttps"])
        self.assertEqual(result["protocol"], "https")


    def test_invalid_url_https_analysis(self):
        result = analyze_https(
            "javascript:alert(1)"
        )

        self.assertIsNone(result["isHttps"])
        self.assertIsNone(result["protocol"])
        self.assertEqual(result["finding"], "invalid_url")


    def test_official_brand_domain(self):
        result = detect_brand_impersonation(
            "https://www.nike.com",
            "nike"
        )

        self.assertTrue(result["isOfficialDomain"])
        self.assertFalse(result["isPotentialImpersonation"])


    def test_brand_name_in_suspicious_domain(self):
        result = detect_brand_impersonation(
            "https://nike-partnerships-example.com",
            "nike"
        )

        self.assertFalse(result["isOfficialDomain"])
        self.assertTrue(result["isPotentialImpersonation"])
        self.assertEqual(
            result["finding"],
            "potential_brand_impersonation"
        )


    def test_official_brand_subdomain(self):
        result = detect_brand_impersonation(
            "https://offers.nike.com",
            "nike"
        )

        self.assertTrue(result["isOfficialDomain"])
        self.assertFalse(result["isPotentialImpersonation"])


    def test_unrelated_domain(self):
        result = detect_brand_impersonation(
            "https://example.com",
            "nike"
        )

        self.assertFalse(result["isOfficialDomain"])
        self.assertFalse(result["isPotentialImpersonation"])


    def test_unknown_brand(self):
        result = detect_brand_impersonation(
            "https://samsung.com",
            "samsung"
        )

        self.assertEqual(result["finding"], "unknown_brand")


    def test_misleading_domain_suffix(self):
        result = detect_brand_impersonation(
            "https://nike.com.attacker.com",
            "nike"
        )

        self.assertFalse(result["isOfficialDomain"])
        self.assertTrue(result["isPotentialImpersonation"])


    def test_analyze_url_integration(self):
        result = analyze_url(
            "https://www.nike.com/products",
            "nike"
        )

        self.assertEqual(
            result["status"],
            "analysis_completed"
        )

        self.assertTrue(
            result["httpsAnalysis"]["isHttps"]
        )

        self.assertFalse(
            result["ipAnalysis"]["isIpBased"]
        )

        self.assertFalse(
            result["shortenerAnalysis"]["isShortened"]
        )

        self.assertTrue(
            result["brandAnalysis"]["isOfficialDomain"]
        )


    def test_analyze_suspicious_url(self):
        result = analyze_url(
            "http://nike-login-example.com",
            "nike"
        )

        self.assertFalse(
            result["httpsAnalysis"]["isHttps"]
        )

        self.assertTrue(
            result["suspiciousPatterns"]["isSuspicious"]
        )

        self.assertTrue(
            result["brandAnalysis"]["isPotentialImpersonation"]
        )


    def test_analyze_url_without_brand(self):
        result = analyze_url(
            "https://example.com"
        )

        self.assertIsNone(result["brandAnalysis"])
        self.assertEqual(
            result["status"],
            "analysis_completed"
        )


    def test_analyze_invalid_url(self):
        result = analyze_url(
            "javascript:alert(1)"
        )

        self.assertEqual(result["status"], "invalid_url")
        self.assertIsNone(result["normalizedUrl"])

if __name__ == "__main__":
    unittest.main()
