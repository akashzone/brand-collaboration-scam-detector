
from fastapi import FastAPI
from pydantic import BaseModel, field_validator

from services.text_analyzer import analyze_text

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

    analysis_result = analyze_text(message)

    return {
        "success": True,
        "data": {
            "message": message,
            "characterCount": len(message),
            "status": "analysis_completed",
            "textAnalysis": analysis_result
        }
    }
