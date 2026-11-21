# 🛡️ Brand Collaboration Scam Detector

An AI-powered security analysis platform designed to help content creators identify fraudulent brand collaboration offers, phishing attempts, and suspicious partnership communications.

The application analyzes collaboration messages, URLs, and domains using rule-based detection, AI-powered analysis, URL security checks, and domain registration intelligence.

**Project Status:** Backend V1 implemented — Frontend development pending 🚧

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Project Objectives](#-project-objectives)
- [Implemented Features](#-implemented-features)
- [Planned Features](#-planned-features)
- [System Architecture](#️-system-architecture)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#️-getting-started)
- [API Documentation](#-api-documentation)
- [Risk Assessment](#-risk-assessment)
- [Testing](#-testing)
- [Development Roadmap](#️-development-roadmap)
- [Security Considerations](#-security-considerations)
- [Learning Outcomes](#-learning-outcomes)
- [Disclaimer](#️-disclaimer)

---

## 📌 Problem Statement

Content creators and influencers frequently receive brand collaboration offers through Instagram DMs, business emails, and other communication platforms.

Scammers exploit these opportunities through:

- Phishing links disguised as collaboration forms.
- Fake brand identities and impersonation attempts.
- Suspicious domains resembling legitimate company websites.
- Requests for personal information, credentials, or upfront payments.
- Artificial urgency and psychological manipulation.
- Fraudulent partnership proposals.

Many creators lack the technical knowledge required to identify these threats.

**Brand Collaboration Scam Detector** aims to address this problem by analyzing suspicious collaboration communications and explaining potential security risks.

---

## 🎯 Project Objectives

- Analyze suspicious brand collaboration messages.
- Identify fraudulent communication patterns using rule-based detection.
- Use LLMs to understand contextual scam indicators.
- Detect suspicious URLs and potential brand impersonation.
- Investigate domain registration information using RDAP.
- Generate explainable risk assessments.
- Handle unavailable analysis services gracefully.
- Help creators understand why a collaboration offer may be suspicious.

---

## ✨ Implemented Features

### 1. Rule-Based Text Analysis

- Detect urgency and pressure tactics.
- Identify upfront payment requests.
- Detect credential and sensitive information requests.
- Identify suspicious off-platform communication.
- Detect shipping and delivery fee requests.
- Identify suspicious social account access requests.
- Extract URLs and email addresses.
- Perform contextual negation handling.
- Generate text analysis summaries and severity counts.

### 2. AI-Powered Analysis

- Gemini API integration.
- Contextual analysis of collaboration messages.
- Scam likelihood classification.
- AI-generated risk score.
- Identification of suspicious evidence.
- Recommended actions for users.
- Structured response validation using Pydantic.
- Graceful handling of unavailable LLM services.

### 3. URL Security Analysis

- URL normalization and validation.
- IP-based URL detection.
- Known URL shortener detection.
- Suspicious hostname pattern detection.
- Excessive subdomain detection.
- HTTP and HTTPS protocol checks.
- Basic brand impersonation checks.

### 4. Domain Intelligence — RDAP

- Domain registration information retrieval.
- Domain registration date extraction.
- Domain expiration date extraction.
- Registrar information extraction.
- Domain status extraction.
- Domain age calculation.
- Identification of newly registered domains.
- Detection of expired domains.
- Identification of suspicious domain status flags.
- Handling of unavailable and rate-limited RDAP responses.

Domain intelligence is currently returned as a separate analysis component and is not included in the numerical risk score.

### 5. Unified Risk-Scoring Engine

- Weighted risk-scoring architecture.
- Text component scoring.
- URL component scoring.
- Dynamic weight normalization when components are unavailable.
- Risk-level classification.
- Handling of missing and malformed analysis results.
- Prevention of cumulative score inflation across multiple URLs.
- Unified risk assessment integrated into FastAPI.

### 6. Backend Architecture

**Node.js and Express**
- REST API development.
- Modular routes, controllers, and services.
- Express-to-FastAPI communication using Axios.
- Input validation.
- Centralized error handling.
- Request timeout handling.
- Partial analysis results and availability warnings.
- Environment configuration and validation.
- Restricted CORS configuration.
- Health endpoint.

**Python and FastAPI**
- Modular analysis services.
- Pydantic request validation.
- Integration of text, URL, LLM, domain, and risk analysis.
- Structured API responses.

### 7. Automated Testing

- Python unit tests using `unittest`.
- Mocked external API calls.
- Gemini integration tests.
- RDAP integration tests.
- Risk-scoring edge-case tests.
- Express API tests using Node.js built-in test runner.
- HTTP endpoint testing using Supertest.
- Mocked Axios requests.

Current test results:

| Service | Passing Tests |
|---|---:|
| Python Analyzer | 105 |
| Express Backend | 15 |
| **Total** | **120** |

---

## 🚧 Planned Features

The following capabilities are not yet implemented.

### 1. External Threat Intelligence

- VirusTotal integration.
- Google Safe Browsing integration.
- Improved typosquatting detection.
- Additional domain reputation checks.

### 2. Screenshot and Attachment Analysis

- OCR using Tesseract.
- Extract text from collaboration screenshots.
- Analyze uploaded screenshots.
- Inspect suspicious attachments and media kits.
- Identify potentially dangerous file types.

### 3. Website Security Analysis

- Browser automation using Playwright.
- Investigate redirects and suspicious website behavior.
- Analyze websites in an isolated environment.
- Implement network restrictions and SSRF protection.

### 4. Frontend Application

- React-based user interface.
- Message and URL submission.
- Loading and error states.
- Visual risk assessment dashboard.
- Detailed analysis results.
- Display evidence and unavailable checks.

### 5. Database and Reporting

- PostgreSQL integration.
- Prisma ORM.
- User authentication.
- Analysis history.
- Downloadable PDF security reports.
- Community-based scam reporting.

### 6. Deployment and Automation

- GitHub Actions CI/CD.
- Automated testing workflows.
- Frontend deployment.
- Backend deployment.
- Production monitoring.

---

## 🏗️ System Architecture

### Current Backend Architecture

```text
                 User / API Client
                         |
                         v
                 Node.js / Express
                    Main API
                         |
                         v
                   Axios Request
                         |
                         v
                  Python / FastAPI
                         |
          --------------------------------
          |              |               |
          v              v               v
    Rule-Based        URL Analysis    Gemini LLM
    Text Analysis
          |              |               |
          --------------------------------
                         |
                         v
                 RDAP Domain Intelligence
                         |
                         v
                 Unified Risk Scoring
                         |
                         v
                  Analysis Results
                         |
                         v
                 Express Backend
                         |
                         v
                    API Response
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
           -----------------------
           |                     |
           v                     v
       PostgreSQL          Python Analyzer
         Database               FastAPI
                                   |
                     -------------------------
                     |          |            |
                     v          v            v
                 Text/LLM      OCR       URL Security
                 Analysis   Analysis      Analysis
                     |          |            |
                     -------------------------
                                   |
                                   v
                            Domain Intelligence
                                   |
                                   v
                              Risk Engine
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
| React | Frontend development (planned) |
| Vite | Frontend tooling (planned) |
| Tailwind CSS | Frontend styling (planned) |
| Node.js | Backend runtime |
| Express.js | REST API development |
| Axios | HTTP communication |
| Python | Analysis engine |
| FastAPI | Python API framework |
| Pydantic | Data validation |
| Gemini API | AI-powered message analysis |
| Requests | External HTTP requests |
| RDAP | Domain registration intelligence |
| PostgreSQL | Database (planned) |
| Prisma | Database ORM (planned) |
| Playwright | Browser automation (planned) |
| Tesseract OCR | Text extraction (planned) |
| VirusTotal API | Threat intelligence (planned) |
| Google Safe Browsing | URL threat detection (planned) |
| Supertest | Express API testing |
| unittest | Python testing |
| Git & GitHub | Version control |
| GitHub Actions | CI/CD (planned) |

---

## 📂 Project Structure

```text
scam-detector/
│
├── frontend/                         # React frontend (pending)
│
├── backend/                          # Node.js + Express API
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── analyzeController.js
│   │   │   └── healthController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── errorMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── analyzeRoutes.js
│   │   │   └── healthRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── analyzeService.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   │   └── analyze.test.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── analyzer/                         # Python analysis service
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── text_analyzer.py
│   │   ├── brand_catalog.py
│   │   ├── url_analyzer.py
│   │   ├── llm_analyzer.py
│   │   ├── risk_scorer.py
│   │   └── domain_intelligence.py
│   │
│   ├── tests/
│   │   ├── test_text_analyzer.py
│   │   ├── test_url_analyzer.py
│   │   ├── test_llm_analyzer.py
│   │   ├── test_risk_scorer.py
│   │   ├── test_main.py
│   │   └── test_domain_intelligence.py
│   │
│   ├── .venv/
│   ├── .env
│   ├── main.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

The `.venv`, `.env`, and `node_modules` directories are local development resources and should not be committed to Git.

---

## ⚙️ Getting Started

### Prerequisites

Install the following:

- Node.js and npm
- Python 3
- Git
- A Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/brand-collaboration-scam-detector.git

cd brand-collaboration-scam-detector
```

### 2. Set up the Express backend

```powershell
cd backend

npm install
```

Create a `.env` file using `.env.example` as a template.

```env
PORT=5000
ANALYZER_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

Start the Express server:

```powershell
npm run dev
```

The Express backend will run at:

`http://localhost:5000`

### 3. Set up the Python analyzer

Open another terminal from the project root:

```powershell
cd analyzer

python -m venv .venv

.venv\Scripts\Activate.ps1

python -m pip install -r requirements.txt
```

Create a `.env` file inside the `analyzer` directory:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.6-flash
```

Replace the placeholder with your own API key. Never commit this file to GitHub.

Start the FastAPI service:

```powershell
python -m uvicorn main:app --reload --port 8000
```

The Python analyzer will run at:

`http://localhost:8000`

### 4. Verify the services

**Express backend**

`http://localhost:5000/api/health`

**Python analyzer**

`http://localhost:8000/health`

**FastAPI Swagger documentation**

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
| POST | `/analyze` | Performs text, URL, domain, LLM, and risk analysis |

### Example Request

**POST** `/api/analyze`

```json
{
  "message": "Congratulations! You have been selected for an exclusive brand collaboration. Pay a registration fee immediately and share your Instagram login credentials for verification. Contact us through WhatsApp: https://bit.ly/example-link"
}
```

### Analysis Response

The Express backend returns the analyzer's data along with availability warnings.

The analysis data includes:

- `textAnalysis`
- `textSummary`
- `urlAnalysis`
- `domainAnalysis`
- `llmAnalysis`
- `riskAssessment`

The response also contains a `warnings` array describing analysis components that were unavailable.

Actual analysis results depend on the submitted message and the availability of external services.

---

## 📊 Risk Assessment

The project uses a weighted scoring approach to combine available analysis results into a unified risk assessment.

### Current Temporary Scoring Weights

| Component | Weight |
|---|---:|
| Text Analysis | 15% |
| URL Analysis | 35% |
| Gemini LLM Analysis | 50% |
| **Total** | **100%** |

These weights are provisional and are normalized when one or more components are unavailable.

RDAP domain intelligence currently provides additional information separately and does not contribute to the numerical risk score.

### Risk Classification

| Risk Score | Risk Level |
|---|---|
| 0–29 | Low |
| 30–59 | Medium |
| 60–79 | High |
| 80–100 | Critical |

A low risk score does not guarantee that a message or website is safe. It only indicates that the implemented analysis detected fewer or less severe risk indicators.

---

## 🧪 Testing

### Python Analyzer Tests

From the `analyzer` directory:

```powershell
python -m unittest discover -s tests -v
```

Current result: **105 tests passing.**

### Express Backend Tests

From the `backend` directory:

```powershell
npm test
```

Current result: **15 tests passing.**

The tests cover:

- Successful API requests.
- Input validation.
- Analyzer connection failures.
- Request timeouts.
- Error handling.
- Partial analysis results.
- Unavailable Gemini and RDAP checks.
- Health endpoint behavior.
- Malformed JSON requests.

---

## 🗺️ Development Roadmap

### Phase 1: Project Foundation — Completed

- [x] Initialize project structure.
- [x] Configure Git and GitHub.
- [x] Set up Express backend.
- [x] Implement routes and controllers.
- [x] Create message analysis API.
- [x] Implement input validation.
- [x] Connect Express with FastAPI.
- [x] Implement centralized error handling.
- [x] Configure environment validation and CORS.
- [x] Add automated Express tests.

### Phase 2: Rule-Based Analysis — Completed

- [x] Implement rule-based text analysis.
- [x] Implement contextual negation handling.
- [x] Extract URLs and email addresses.
- [x] Implement text analysis summaries.
- [x] Implement brand-domain checks.

### Phase 3: Advanced URL and AI Analysis — Completed

- [x] Implement URL normalization.
- [x] Detect IP-based URLs.
- [x] Detect URL shorteners.
- [x] Identify suspicious URL patterns.
- [x] Implement HTTP and HTTPS checks.
- [x] Implement basic URL brand impersonation checks.
- [x] Integrate Gemini LLM.
- [x] Add Gemini unit tests.

### Phase 4: Unified Risk Assessment — Completed

- [x] Create risk-scoring module.
- [x] Implement risk-level classification.
- [x] Implement text component scoring.
- [x] Implement URL component scoring.
- [x] Integrate component scores.
- [x] Add unified risk assessment to FastAPI response.
- [x] Test the complete scoring pipeline.
- [x] Improve scoring reliability and edge-case handling.

### Phase 5: Domain Intelligence — Completed

- [x] Implement domain normalization.
- [x] Integrate RDAP.
- [x] Extract registration information.
- [x] Calculate domain age.
- [x] Detect suspicious domain characteristics.
- [x] Add domain intelligence unit tests.
- [x] Integrate domain analysis into FastAPI.
- [x] Add RDAP integration tests.

### Phase 6: Express Backend Hardening — Completed

- [x] Implement Axios timeout handling.
- [x] Add centralized error middleware.
- [x] Implement partial analysis responses.
- [x] Add automated API tests.
- [x] Validate environment configuration.
- [x] Configure restricted CORS.
- [x] Handle malformed JSON.
- [x] Improve health endpoint.
- [x] Create `.env.example`.

### Phase 7: Frontend Development — Pending

- [ ] Initialize React and Vite.
- [ ] Configure Tailwind CSS.
- [ ] Build the message analysis interface.
- [ ] Integrate React with Express.
- [ ] Display risk assessment results.
- [ ] Display suspicious evidence.
- [ ] Display unavailable analysis checks.
- [ ] Implement loading and error states.

### Phase 8: Integration and Deployment — Pending

- [ ] Perform complete frontend-backend integration testing.
- [ ] Evaluate detection accuracy and false positives.
- [ ] Configure GitHub Actions CI.
- [ ] Deploy Express and FastAPI.
- [ ] Deploy the frontend.
- [ ] Perform production testing.
- [ ] Complete project documentation.

### Future V2 Development

- [ ] Integrate VirusTotal.
- [ ] Integrate Google Safe Browsing.
- [ ] Implement Tesseract OCR.
- [ ] Support screenshot and attachment analysis.
- [ ] Integrate Playwright for website inspection.
- [ ] Implement PostgreSQL and Prisma.
- [ ] Add authentication and analysis history.
- [ ] Generate downloadable PDF reports.
- [ ] Implement community threat reporting.

---

## 🔐 Security Considerations

Security is a central consideration in this project.

Implemented and planned safeguards include:

- Input validation.
- Secure API key and environment variable management.
- Prompt-injection-aware LLM instructions.
- Centralized error handling.
- Request timeout handling.
- Restricted browser-origin access through CORS.
- SSRF protection when inspecting external URLs.
- Isolated execution for suspicious website analysis.
- Safe handling of uploaded files and attachments.
- Data minimization and retention controls.
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
- Domain registration intelligence using RDAP.
- Risk-scoring algorithms.
- Unit testing and error handling.
- Git and GitHub version control.
- Environment configuration and API security.

---

## ⚠️ Disclaimer

This project is intended for educational and research purposes.

Automated security analysis cannot guarantee that a collaboration offer, website, domain, or attachment is safe.

Generated risk scores and classifications should be treated as indicators to support decision-making, not definitive security guarantees.

Users should independently verify suspicious collaboration offers through official brand communication channels.

---

## 👨‍💻 Author

Developed as a Computer Science project to explore the intersection of full-stack development, artificial intelligence, and cybersecurity.

---

⭐ If you find this project interesting, consider giving the repository a star!