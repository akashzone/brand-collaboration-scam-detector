# 🛡️ Brand Collaboration Scam Detector

An AI-powered security analysis platform designed to help content creators identify fraudulent brand collaboration offers, phishing attempts, and suspicious partnership communications.

The application analyzes collaboration messages, URLs, and suspicious communication patterns using rule-based detection, AI-powered analysis, and URL security checks to help creators make informed decisions before interacting with potentially malicious offers.

**Project Status:** Under Active Development 🚧

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Project Objectives](#-project-objectives)
- [Features](#-features)
- [System Architecture](#️-system-architecture)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#️-getting-started)
- [API Documentation](#-api-documentation)
- [Risk Assessment](#-risk-assessment)
- [Development Roadmap](#️-development-roadmap)
- [Security Considerations](#-security-considerations)
- [Learning Outcomes](#-learning-outcomes)
- [Disclaimer](#️-disclaimer)

---

## 📌 Problem Statement

Content creators and influencers frequently receive brand collaboration offers through Instagram DMs, business emails, and other communication platforms.

Unfortunately, scammers exploit these opportunities by impersonating legitimate brands and sending fraudulent partnership proposals containing:

- Phishing links disguised as collaboration forms.
- Fake brand identities and impersonation attempts.
- Malicious attachments and media kits.
- Suspicious domains resembling legitimate company websites.
- Requests for personal information, credentials, or upfront payments.
- Artificial urgency and psychological manipulation.

Many creators lack the technical knowledge required to identify these threats.

**Brand Collaboration Scam Detector** aims to address this problem by providing an intelligent platform that analyzes suspicious collaboration communications and explains potential security risks.

---

## 🎯 Project Objectives

- Analyze suspicious brand collaboration messages.
- Identify fraudulent communication patterns using rule-based detection.
- Use LLMs to understand contextual scam indicators.
- Detect suspicious URLs and potential brand impersonation.
- Extract text from uploaded screenshots using OCR.
- Investigate suspicious websites in a controlled environment.
- Integrate external threat intelligence services.
- Generate explainable risk assessments.
- Help creators understand why a collaboration offer may be dangerous.

---

## ✨ Features

### ✅ Implemented Features

The following capabilities have been implemented in the current development stage.

**1. Message Analysis**
- Analyze suspicious collaboration messages.
- Detect urgency and pressure tactics.
- Identify upfront payment requests.
- Detect credential and sensitive information requests.
- Identify suspicious off-platform communication.
- Extract URLs and email addresses from messages.
- Perform basic brand-domain mismatch checks.

**2. AI-Powered Analysis**
- Gemini API integration.
- Contextual analysis of collaboration messages.
- Scam likelihood classification.
- AI-generated risk score.
- Identification of suspicious evidence.
- Recommended actions for users.
- Graceful handling of unavailable LLM services.

**3. URL Security Analysis**
- URL normalization and validation.
- IP-based URL detection.
- Known URL shortener detection.
- Suspicious URL pattern detection.
- HTTP and HTTPS protocol checks.
- Basic brand impersonation checks.

**4. Risk Scoring Engine — In Progress**
- Weighted risk-scoring architecture.
- Text component scoring.
- URL component scoring.
- Unified risk assessment integration in progress.

**5. Backend Architecture**
- Node.js and Express REST API.
- Python and FastAPI analysis service.
- Express-to-FastAPI communication.
- Request validation and error handling.
- Modular controllers, routes, and services.

**6. Testing**
- Unit tests for text analysis.
- Unit tests for URL analysis.
- Mocked unit tests for Gemini integration.
- Unit tests for the risk-scoring engine.

### 🚧 Planned Features

**1. Domain Intelligence**
- Domain age investigation using RDAP.
- Typosquatting and suspicious domain detection.
- VirusTotal integration.
- Google Safe Browsing integration.

**2. Screenshot and Attachment Analysis**
- OCR using Tesseract.
- Extract text from collaboration screenshots.
- Inspect suspicious attachments and media kits.
- Identify potentially dangerous file types.

**3. Website Security Analysis**
- Browser automation using Playwright.
- Investigate redirects and suspicious website behavior.
- Analyze websites in an isolated environment.

**4. Reporting and Community Intelligence**
- Downloadable security analysis reports.
- Community-based scam reporting.
- Database of reported suspicious domains and campaigns.

**5. Frontend Application**
- React-based user interface.
- Message and URL submission.
- File and screenshot uploads.
- Visual risk assessment dashboard.
- Detailed analysis results.

---

## 🏗️ System Architecture

The application follows a modular architecture consisting of a React frontend, Node.js backend, Python analysis service, and database.

### Current Backend Architecture

```text
                User
                  |
                  v
          Node.js / Express
             Main API
                  |
                  v
           Axios HTTP Request
                  |
                  v
           Python / FastAPI
                  |
        -----------------------
        |          |          |
        v          v          v
   Rule-Based    URL       Gemini
     Analysis  Analysis    LLM API
        |          |          |
        -----------------------
                  |
                  v
          Analysis Results
                  |
                  v
          Express Backend
                  |
                  v
              Response
```

### Planned Complete Architecture

```text
                 User
                   |
                   v
             React Frontend
                   |
                   v
           Node.js / Express
              Main Backend
                   |
          ---------------------
          |                   |
          v                   v
      PostgreSQL        Python Analyzer
       Database             FastAPI
                               |
                  ------------------------
                  |          |           |
                  v          v           v
              Text/LLM      OCR       URL Security
               Analysis   Analysis      Analysis
                  |          |           |
                  ------------------------
                               |
                               v
                       Risk Assessment
                               |
                               v
                      Analysis Results
                               |
                               v
                         Frontend
```

The Express backend acts as the central communication layer, while the Python analyzer handles specialized analysis operations.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend development |
| Tailwind CSS | Frontend styling |
| Node.js | Backend runtime |
| Express.js | REST API development |
| Axios | HTTP communication |
| Python | Analysis engine |
| FastAPI | Python API framework |
| Pydantic | Data validation |
| Gemini API | AI-powered message analysis |
| PostgreSQL | Database |
| Prisma | Database ORM |
| Playwright | Browser automation |
| Tesseract OCR | Text extraction |
| VirusTotal API | Threat intelligence |
| Google Safe Browsing | URL threat detection |
| RDAP | Domain registration information |
| Git & GitHub | Version control |

*Some technologies are planned for future implementation.*

---

## 📂 Project Structure

```text
scam-detector/
│
├── frontend/                     # React frontend (in development)
│
├── backend/                      # Node.js + Express API
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── analyzeController.js
│   │   │   └── healthController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── analyzeRoutes.js
│   │   │   └── healthRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── analyzeService.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── analyzer/                     # Python analysis service
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── text_analyzer.py
│   │   ├── brand_catalog.py
│   │   ├── url_analyzer.py
│   │   ├── llm_analyzer.py
│   │   └── risk_scorer.py
│   │
│   ├── tests/
│   │   ├── test_text_analyzer.py
│   │   ├── test_url_analyzer.py
│   │   ├── test_llm_analyzer.py
│   │   └── test_risk_scorer.py
│   │
│   ├── .venv/
│   ├── .env
│   ├── main.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

*The `.venv` and `.env` directories/files are local development resources and should not be committed to Git.*

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Python 3
- Git
- A Gemini API key

PostgreSQL will be required when database integration is implemented.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/brand-collaboration-scam-detector.git
```

```bash
cd brand-collaboration-scam-detector
```

### 2. Set up the Node.js backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
ANALYZER_URL=http://localhost:8000
```

Start the Express server:

```bash
npm run dev
```

The Express backend will run at:

`http://localhost:5000`

### 3. Set up the Python analyzer

Open another terminal from the project root:

```bash
cd analyzer
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install Python dependencies:

```bash
python -m pip install -r requirements.txt
```

Create a `.env` file inside the `analyzer` directory:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.6-flash
```

Replace the placeholder with your own API key. Never commit this file to GitHub.

Start the FastAPI service:

```bash
python -m uvicorn main:app --reload --port 8000
```

The Python analyzer will run at:

`http://localhost:8000`

### 4. Verify the services

**Express backend:**

`http://localhost:5000/api/health`

**Python analyzer:**

`http://localhost:8000/health`

**FastAPI Swagger documentation:**

`http://localhost:8000/docs`

Keep both backend services running when testing the complete analysis flow through Express.

---

## 🔌 API Documentation

### Node.js Backend

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend welcome message |
| GET | `/api/health` | Backend health check |
| POST | `/api/analyze` | Accepts and forwards a suspicious message for analysis |

### Python Analyzer

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Analyzer welcome message |
| GET | `/health` | Analyzer health check |
| POST | `/analyze` | Performs message, URL, and LLM analysis |

### Example Request

**POST** `/api/analyze`

```json
{
  "message": "Congratulations! You have been selected for an exclusive brand collaboration. Pay a registration fee immediately and share your Instagram login credentials for verification. Contact us through WhatsApp: https://bit.ly/example-link"
}
```

### Current Analysis Response Structure

The Python analyzer currently returns a combined response containing:

```json
{
  "success": true,
  "data": {
    "textAnalysis": {
      "indicatorCount": 3,
      "indicators": [],
      "entities": {
        "urls": [],
        "emailAddresses": []
      },
      "brandDomainChecks": []
    },
    "textSummary": {
      "totalIndicators": 3,
      "severityCounts": {
        "high": 2,
        "medium": 1,
        "low": 0
      },
      "classification": "High"
    },
    "urlAnalysis": [],
    "llmAnalysis": {
      "status": "completed",
      "data": {
        "scam_likelihood": "high",
        "risk_score": 98,
        "summary": "Example analysis summary.",
        "indicators": [],
        "recommended_actions": []
      }
    }
  }
}
```

*This is an illustrative response structure. Actual results depend on the submitted message and the availability of the Gemini service.*

The unified `riskAssessment` response is currently under development.

---

## 📊 Risk Assessment

The project uses a weighted scoring approach to combine different analysis results into a single risk assessment.

### Current Temporary Scoring Weights

| Component | Weight |
|---|---:|
| Text Analysis | 15% |
| URL Analysis | 35% |
| Gemini LLM Analysis | 50% |
| **Total** | **100%** |

These are provisional weights for the current development stage.

The planned complete scoring architecture will also incorporate domain intelligence and sandbox analysis.

### Risk Classification

| Risk Score | Risk Level |
|---|---|
| 0–29 | Low |
| 30–59 | Medium |
| 60–79 | High |
| 80–100 | Critical |

A low risk score does not guarantee that a message or website is safe. It only indicates that the implemented analysis detected fewer or less severe risk indicators.

---

## 🗺️ Development Roadmap

### Phase 1: Project Foundation
- [x] Initialize project structure.
- [x] Configure Git and GitHub.
- [x] Set up Express backend.
- [x] Implement routes and controllers.
- [x] Create message analysis API.
- [x] Implement input validation.

### Phase 2: Python Analyzer
- [x] Initialize FastAPI application.
- [x] Connect Express with FastAPI.
- [x] Implement rule-based text analysis.
- [x] Implement text analysis summaries.
- [x] Extract URLs and email addresses.
- [x] Implement basic brand-domain checks.

### Phase 3: Advanced Analysis
- [x] Implement URL normalization.
- [x] Detect IP-based URLs.
- [x] Detect URL shorteners.
- [x] Identify suspicious URL patterns.
- [x] Implement HTTPS checks.
- [x] Implement basic URL brand impersonation checks.
- [x] Integrate Gemini LLM.
- [x] Add Gemini unit tests.

### Phase 4: Unified Risk Assessment
- [x] Create risk-scoring module.
- [x] Implement risk-level classification.
- [x] Add risk-scoring unit tests.
- [x] Implement text component scoring.
- [ ] Implement URL component scoring.
- [ ] Integrate component scores.
- [ ] Add unified risk assessment to FastAPI response.
- [ ] Test the complete scoring pipeline.

### Phase 5: Domain Intelligence
- [ ] Implement domain age analysis using RDAP.
- [ ] Integrate VirusTotal.
- [ ] Integrate Google Safe Browsing.
- [ ] Improve brand impersonation and typosquatting detection.

### Phase 6: Screenshot and Attachment Analysis
- [ ] Integrate Tesseract OCR.
- [ ] Support screenshot uploads.
- [ ] Extract and analyze screenshot text.
- [ ] Implement safe attachment inspection.

### Phase 7: Website Security Analysis
- [ ] Integrate Playwright.
- [ ] Implement isolated browser inspection.
- [ ] Analyze redirects and suspicious website behavior.
- [ ] Add SSRF protection and network restrictions.

### Phase 8: Frontend Development
- [ ] Initialize React and Vite.
- [ ] Configure Tailwind CSS.
- [ ] Build the message analysis interface.
- [ ] Display risk assessment results.
- [ ] Build a detailed analysis dashboard.
- [ ] Add screenshot and attachment uploads.

### Phase 9: Database and Reporting
- [ ] Integrate PostgreSQL.
- [ ] Configure Prisma ORM.
- [ ] Implement user and analysis data models.
- [ ] Generate downloadable PDF reports.
- [ ] Implement community threat reporting.

### Phase 10: Testing and Deployment
- [ ] Perform integration testing.
- [ ] Evaluate detection accuracy and false positives.
- [ ] Add security testing.
- [ ] Configure Docker.
- [ ] Deploy backend and frontend.
- [ ] Complete project documentation.

---

## 🔐 Security Considerations

Security is a central consideration in this project.

Planned safeguards include:

- Input validation and sanitization.
- Secure API key and environment variable management.
- Protection against prompt injection.
- SSRF protection when inspecting external URLs.
- Isolated execution for suspicious website analysis.
- Safe handling of uploaded files and attachments.
- Data minimization and retention controls.
- Network restrictions for browser automation.
- Careful handling of external API responses.

URL inspection and automated website analysis must not be treated as safe merely because a URL uses HTTPS.

---

## 🎓 Learning Outcomes

This project explores practical concepts in:

- Full-stack application development.
- REST API design and integration.
- Backend architecture and modular programming.
- Python and Node.js interoperability.
- AI and LLM integration.
- Rule-based detection systems.
- Cybersecurity fundamentals.
- URL and domain security analysis.
- Browser automation and OCR.
- Unit testing and error handling.
- Database design and threat intelligence.
- Git and GitHub version control.

---

## ⚠️ Disclaimer

This project is intended for educational and research purposes.

Automated security analysis cannot guarantee that a collaboration offer, website, domain, or attachment is safe.

The generated risk scores and classifications should be treated as indicators to support decision-making, not definitive security guarantees.

Users should independently verify suspicious collaboration offers through official brand communication channels.

---

## 👨‍💻 Author

Developed as a Computer Science project to explore the intersection of full-stack development, artificial intelligence, and cybersecurity.

---

⭐ If you find this project interesting, consider giving the repository a star!
