# Brand Collaboration Scam Detector 🛡️

An intelligent security tool designed to help content creators identify fraudulent brand collaboration offers, phishing attempts, and suspicious partnership communications.

The application analyzes collaboration messages, suspicious URLs, domains, and attachments to help creators make informed decisions before interacting with potentially malicious offers.

> **Project Status:** Under Development 🚧

---

## 📌 Problem Statement

Content creators and influencers frequently receive brand collaboration offers through Instagram DMs, business emails, and other communication platforms.

Unfortunately, scammers exploit these opportunities by impersonating legitimate brands and sending fraudulent partnership proposals containing:

- Phishing links disguised as collaboration forms.
- Fake brand identities and impersonation attempts.
- Malicious attachments and media kits.
- Suspicious domains resembling legitimate company websites.
- Requests for personal information, credentials, or payments.

Many creators may not have the technical knowledge required to identify these threats.

**Brand Collaboration Scam Detector** aims to address this problem by providing an intelligent platform that analyzes suspicious collaboration communications and explains potential security risks.

---

## 🎯 Project Objectives

- Analyze suspicious brand collaboration messages.
- Identify potentially fraudulent communication patterns.
- Detect suspicious URLs and domain impersonation.
- Extract text from uploaded screenshots using OCR.
- Investigate suspicious websites in a controlled environment.
- Integrate external threat intelligence services.
- Generate explainable risk assessments.
- Help creators understand why a collaboration offer may be dangerous.

---

## ✨ Planned Features

The following features are planned for the project. They are not all implemented yet.

### 1. Message Analysis
- Analyze suspicious collaboration messages.
- Identify urgency, suspicious payment requests, and impersonation indicators.
- Use LLM-assisted analysis and rule-based detection.

### 2. URL and Domain Intelligence
- Inspect suspicious URLs.
- Identify potentially malicious domains.
- Investigate domain age and domain impersonation.
- Integrate VirusTotal and Google Safe Browsing.

### 3. Screenshot and Attachment Analysis
- Extract text from screenshots using OCR.
- Inspect suspicious files and media kits.
- Identify potentially dangerous content.

### 4. Website Security Analysis
- Analyze suspicious websites using Playwright.
- Investigate redirects and suspicious website behavior.
- Execute browser inspection in a controlled, isolated environment.

### 5. Risk Assessment
- Generate an explainable risk score between 0 and 100.
- Highlight suspicious indicators.
- Provide recommendations based on identified risks.

### 6. Reporting and Community Intelligence
- Generate downloadable analysis reports.
- Allow users to report suspicious collaboration attempts.
- Maintain a community-driven database of reported threats.

---

## 🏗️ System Architecture

The application follows a modular architecture consisting of three primary components.

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
       ----------------
       |              |
       v              v
  PostgreSQL      Python Analyzer
  Database          FastAPI
                       |
              -----------------
              |       |       |
              v       v       v
             LLM     OCR   Security
                            Analysis
```

The Express backend acts as the central communication layer, while the Python analyzer will handle specialized analysis operations.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend development |
| Node.js | Backend runtime |
| Express.js | REST API development |
| Python | Analysis engine |
| FastAPI | Python API framework |
| PostgreSQL | Database |
| Prisma | Database ORM |
| Playwright | Browser automation |
| Tesseract OCR | Text extraction |
| VirusTotal API | Threat intelligence |
| Google Safe Browsing | URL threat detection |
| LLM API | Intelligent message analysis |
| Git & GitHub | Version control |

*Some technologies are planned for future implementation.*

---

## 📂 Project Structure

```text
scam-detector/
│
├── frontend/                 # React application
│
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── analyzer/                 # Python analysis service
│   ├── .venv/
│   ├── main.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Python 3
- Git
- PostgreSQL (for future database integration)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/brand-collaboration-scam-detector.git
```

```bash
cd brand-collaboration-scam-detector
```

### 2. Set up the Node.js backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
```

Start the backend:

```bash
npm run dev
```

The Express server will run at:

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

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the FastAPI server:

```bash
python -m uvicorn main:app --reload --port 8000
```

The Python analyzer will run at:

`http://localhost:8000`

---

## 🔌 Currently Available API Endpoints

### Node.js Backend

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend welcome message |
| GET | `/api/health` | Backend health check |
| POST | `/api/analyze` | Accepts and validates a suspicious message |

### Python Analyzer

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Analyzer welcome message |
| GET | `/health` | Analyzer health check |
| POST | `/analyze` | Accepts and validates a message |

### Example Request

**POST** `/api/analyze`

```json
{
  "message": "We are XYZ Brand. We would love to collaborate with you."
}
```

### Example Response

```json
{
  "success": true,
  "data": {
    "message": "We are XYZ Brand. We would love to collaborate with you.",
    "characterCount": 56,
    "status": "received"
  }
}
```

**Note:** The current endpoints demonstrate request handling and input validation. Actual scam detection and risk assessment are planned for subsequent development stages.

---

## 🗺️ Development Roadmap

- [x] Project initialization
- [x] Express backend setup
- [x] Backend routes and controllers
- [x] Message analysis API with input validation
- [x] Python analyzer initialization
- [ ] Connect Node.js backend with Python analyzer
- [ ] Implement message analysis logic
- [ ] Implement rule-based scam detection
- [ ] Integrate LLM-based analysis
- [ ] Implement URL and domain intelligence
- [ ] Integrate external threat intelligence APIs
- [ ] Implement screenshot OCR
- [ ] Implement Playwright website analysis
- [ ] Develop explainable risk scoring
- [ ] Build React frontend
- [ ] Integrate PostgreSQL and Prisma
- [ ] Generate downloadable security reports
- [ ] Implement community threat reporting
- [ ] Testing, evaluation, and deployment

---

## 🔐 Security Considerations

Security is a central consideration in this project.

Planned safeguards include:

- Isolated execution for suspicious website analysis.
- Protection against Server-Side Request Forgery (SSRF).
- Input validation and sanitization.
- Protection against prompt injection.
- Secure API key and environment variable management.
- Data minimization and retention controls.
- Careful handling of uploaded files and external URLs.

---

## 🎓 Learning Outcomes

This project is intended to explore and demonstrate practical knowledge of:

- Full-stack application development.
- REST API design and integration.
- Backend architecture and modular programming.
- Python and Node.js interoperability.
- AI and LLM integration.
- Cybersecurity fundamentals.
- Browser automation and OCR.
- Database design and threat intelligence.
- Git and collaborative development practices.

---

## ⚠️ Disclaimer

This project is intended for educational and research purposes.

Automated security analysis cannot guarantee that a collaboration offer, website, domain, or attachment is safe. Results should be treated as risk indicators rather than definitive security guarantees.

---

## 👨‍💻 Author

Developed as a Computer Science project to explore the intersection of full-stack development, artificial intelligence, and cybersecurity.

---

⭐ If you find this project interesting, consider giving the repository a star!