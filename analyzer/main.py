
from fastapi import FastAPI
from pydantic import BaseModel, field_validator

from services.text_analyzer import (
    analyze_text,
    generate_text_summary
)

from services.url_analyzer import analyze_url

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

    # Step 5: Return combined results
    return {
        "success": True,
        "data": {
            "textAnalysis": text_analysis,
            "textSummary": text_summary,
            "urlAnalysis": url_analysis
        }
    }
