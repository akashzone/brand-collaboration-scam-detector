from fastapi import FastAPI
from pydantic import BaseModel, field_validator
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor

from services.text_analyzer import (
    analyze_text,
    generate_text_summary
)

from services.url_analyzer import analyze_url
from services.llm_analyzer import analyze_message_with_llm
from services.domain_intelligence import analyze_domain_intelligence

from services.risk_scorer import (
    calculate_risk_score,
    calculate_text_component_score,
    calculate_url_component_score,
    calculate_domain_component_score
)
# Initialize FastAPI
app = FastAPI(
    title="Scam Detector Analyzer",
    description="Python analysis service for the Brand Collaboration Scam Detector",
    version="1.0.0"
)


# Define the request structure
class AnalyzeRequest(BaseModel):
    message: str

    @field_validator("message")
    @classmethod
    def validate_message(cls, value):
        value = value.strip()

        if not value:
            raise ValueError("Message cannot be empty")

        if len(value) > 10000:
            raise ValueError("Message cannot exceed 10000 characters")

        return value


# Root endpoint
@app.get("/")
def root():
    return {
        "success": True,
        "message": "Scam Detector Python Analyzer is running!"
    }


# Health endpoint
@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "Python Analyzer is healthy"
    }


def extract_unique_domains(urls: list[str]) -> list[str]:
    domains = set()

    for url in urls:
        parsed_url = urlparse(url)

        domain = parsed_url.hostname

        if domain:
            domain = domain.lower()

            if domain.startswith("www."):
                domain = domain[4:]

            domains.add(domain)

    return list(domains)

@app.post("/analyze")
def analyze_message(request: AnalyzeRequest):
    message = request.message

    # Step 1: Analyze the message
    text_analysis = analyze_text(message)

    # Step 2: Generate the text analysis summary
    text_summary = generate_text_summary(
        text_analysis["indicators"]
    )

    # Step 3: Extract URLs from the message
    extracted_urls = text_analysis.get(
        "entities", {}
    ).get("urls", [])

    # Step 4: Analyze every extracted URL
    url_analysis = [
        analyze_url(url)
        for url in extracted_urls
    ]
    
    # Step 5: Extract unique domains
    unique_domains = extract_unique_domains(extracted_urls)

    # Step 6: Concurrently analyze domains via RDAP and call Gemini LLM
    # RDAP network calls and Gemini LLM analysis are I/O bound and independent
    with ThreadPoolExecutor(max_workers=max(len(unique_domains) + 1, 2)) as executor:
        domain_futures = [
            executor.submit(analyze_domain_intelligence, domain)
            for domain in unique_domains
        ]
        llm_future = executor.submit(analyze_message_with_llm, message)

        domain_analysis = [future.result() for future in domain_futures]

        try:
            llm_result = llm_future.result()
            llm_analysis = {
                "status": "completed",
                "data": llm_result
            }
        except RuntimeError as err:
            print(f"WARN: LLM analysis unavailable -> {err}")
            llm_analysis = {
                "status": "unavailable",
                "message": "LLM analysis is temporarily unavailable."
            }
        
    # Step 7: Calculate individual component scores

    text_score = calculate_text_component_score(text_analysis)

    url_score = calculate_url_component_score(url_analysis)

    rdap_score = calculate_domain_component_score(domain_analysis)

    llm_score = None

    if llm_analysis["status"] == "completed":
        llm_score = llm_analysis["data"]["risk_score"]

    risk_assessment = calculate_risk_score(
        text_score=text_score,
        url_score=url_score,
        llm_score=llm_score,
        rdap_score=rdap_score
    )
    # Step 8: Return combined results

    return {
    "success": True,
    "data": {
        "textAnalysis": text_analysis,
        "textSummary": text_summary,
        "urlAnalysis": url_analysis,
        "domainAnalysis": domain_analysis,
        "llmAnalysis": llm_analysis,
        "riskAssessment": risk_assessment
        }
    }
