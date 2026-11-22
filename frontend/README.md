# Scam Detector — Frontend

React + Vite + Tailwind CSS client for the Brand Collaboration Scam Detector.
It talks **only** to the Express backend (`POST /api/analyze`, `GET /api/health`),
never to the Python analyzer directly.

Design decisions, tokens and rationale: [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md).

## Run locally

Start the analyzer (port 8000) and the Express backend (port 5000) first, as
described in the root README. Then:

```powershell
cd frontend
npm install
copy .env.example .env   # optional; defaults to http://localhost:5000
npm run dev              # http://localhost:5173
```

The dev server is pinned to port 5173 because the backend's CORS policy only
allows `FRONTEND_URL` (default `http://localhost:5173`).

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Unit and component tests (Vitest + Testing Library) |

## Configuration

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000` | Express backend URL. Every `VITE_*` value is visible in the browser, so never put secrets here. |

## Structure

```text
src/
├── main.jsx, App.jsx        Entry and application shell
├── index.css                Global styles; imports the design tokens
├── styles/tokens.css        Design tokens (Tailwind @theme)
├── pages/AnalyzePage.jsx    The single V1 page: workspace + report
├── services/                API layer: Axios client, analyze/health calls, error mapping
├── hooks/                   useAnalysis (request lifecycle), useApiHealth, useElapsedSeconds
├── utils/                   Response → view-model (report.js), evidence highlighting,
│                            defanging, risk tones, formatters, type guards
├── constants/               Example input message (input only; never a result)
├── components/
│   ├── layout/              Header, API status, footer, skip link
│   ├── ui/                  Button, Tag, SeverityTag, StatusTag, Alert, Evidence, Logo
│   ├── workspace/           Message form and annotated-message view
│   └── report/              Report sheet and one component per section, plus
│                            empty/loading/error states and an error boundary
└── test/                    Vitest suites; fixtures/ holds a response recorded
                             from the real backend, used by tests only
```

## How API data is handled

- `services/analyzeService.js` checks the response envelope (`success`, `data`,
  `warnings`). A malformed body becomes an `INVALID_RESPONSE` error.
- `utils/report.js` reads every nested field defensively and gives each
  section a status of `complete`, `partial`, `unavailable` or
  `not_applicable`. Missing data is never replaced by a value that could look
  like a clean result.
- `services/apiErrors.js` maps every backend error code (`MESSAGE_*`,
  `ANALYZER_TIMEOUT`, `ANALYZER_UNAVAILABLE`, `ANALYZER_ERROR`, …) and client
  failures (unreachable API, timeout) to user-facing copy. Validation errors
  are shown next to the field.
- Suspicious URLs are shown defanged (`hxxps://example[.]com`) and are never
  rendered as links.
