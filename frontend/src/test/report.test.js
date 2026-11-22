// Test fixtures only: partialResponse.json is a response recorded from the real
// Express backend (Gemini unavailable). Nothing here is used by the app.
import { describe, expect, it } from "vitest";
import recorded from "./fixtures/partialResponse.json";
import { annotateMessage } from "../utils/annotate.js";
import { defangUrl } from "../utils/defang.js";
import { buildReport, STATUS } from "../utils/report.js";
import { parseAnalysisResponse } from "../services/analyzeService.js";
import { toApiError } from "../services/apiErrors.js";

const clone = (value) => structuredClone(value);

describe("parseAnalysisResponse", () => {
  it("accepts the real backend envelope", () => {
    const parsed = parseAnalysisResponse(recorded);
    expect(parsed.data.riskAssessment.riskScore).toBe(recorded.data.riskAssessment.riskScore);
    expect(parsed.warnings).toHaveLength(1);
  });

  it.each([null, "oops", { success: false }, { success: true }, { success: true, data: [] }])(
    "rejects a malformed body: %j",
    (body) => {
      expect(() => parseAnalysisResponse(body)).toThrowError(
        expect.objectContaining({ code: "INVALID_RESPONSE" })
      );
    }
  );

  it("tolerates a missing warnings array", () => {
    const body = clone(recorded);
    delete body.warnings;
    expect(parseAnalysisResponse(body).warnings).toEqual([]);
  });
});

describe("buildReport with a recorded partial response", () => {
  const report = buildReport(parseAnalysisResponse(recorded));

  it("marks the report partial because Gemini was unavailable", () => {
    expect(report.llm.status).toBe(STATUS.UNAVAILABLE);
    expect(report.coverage.status).toBe(STATUS.PARTIAL);
    expect(report.risk.status).toBe(STATUS.PARTIAL);
  });

  it("never invents a score for a missing component", () => {
    const llm = report.risk.components.find((component) => component.key === "llm");
    expect(llm.score).toBeNull();
    expect(llm.reason).toMatch(/unavailable/i);
  });

  it("uses the backend's score and level as returned", () => {
    expect(report.risk.score).toBe(recorded.data.riskAssessment.riskScore);
    expect(report.risk.level).toBe(recorded.data.riskAssessment.riskLevel);
  });

  it("treats an RDAP not_found as not completed", () => {
    const notFound = report.domains.items.find((item) => item.status === "not_found");
    expect(notFound.registration).toBeNull();
    expect(report.domains.status).toBe(STATUS.PARTIAL);
  });

  it("dedupes backend warnings and labels them for people", () => {
    expect(report.warnings).toEqual([
      { component: "AI assessment", domain: null, message: "LLM analysis was unavailable." }
    ]);
  });
});

describe("buildReport edge cases", () => {
  it("reports no links as not applicable, not as a failure", () => {
    const body = clone(recorded);
    body.data.urlAnalysis = [];
    body.data.domainAnalysis = [];
    body.data.riskAssessment.componentScores = { text: 75 };
    const report = buildReport(body);
    expect(report.urls.status).toBe(STATUS.NOT_APPLICABLE);
    expect(report.domains.status).toBe(STATUS.NOT_APPLICABLE);
    expect(report.risk.components.find((c) => c.key === "url").reason).toBe("No links in the message");
  });

  it("shows every component as unavailable when data is empty", () => {
    const report = buildReport({ data: {}, warnings: [] });
    expect(report.text.status).toBe(STATUS.UNAVAILABLE);
    expect(report.urls.status).toBe(STATUS.UNAVAILABLE);
    expect(report.domains.status).toBe(STATUS.UNAVAILABLE);
    expect(report.llm.status).toBe(STATUS.UNAVAILABLE);
    expect(report.risk.status).toBe(STATUS.UNAVAILABLE);
  });

  it("reads a completed Gemini result using the analyzer's field names", () => {
    const body = clone(recorded);
    body.data.llmAnalysis = {
      status: "completed",
      data: {
        scam_likelihood: "high",
        risk_score: 88,
        summary: "Summary text",
        indicators: [{ category: "Payment", evidence: "registration fee", explanation: "Why" }],
        recommended_actions: ["Do not pay"]
      }
    };
    const { llm } = buildReport(body);
    expect(llm).toMatchObject({ status: STATUS.COMPLETE, likelihood: "high", score: 88, actions: ["Do not pay"] });
  });
});

describe("annotateMessage", () => {
  it("highlights evidence case-insensitively at the right severity", () => {
    const segments = annotateMessage("Please PAY THE Registration Fee now", {
      indicators: [{ severity: "high", description: "Payment", evidence: ["registration fee"] }]
    });
    const marked = segments.filter((segment) => segment.kind);
    expect(marked).toEqual([{ text: "Registration Fee", kind: "high", labels: ["Payment"] }]);
    expect(segments.map((segment) => segment.text).join("")).toBe("Please PAY THE Registration Fee now");
  });

  it("lets the higher severity win on overlap", () => {
    const segments = annotateMessage("act now and pay", {
      indicators: [
        { severity: "medium", evidence: ["act now and"] },
        { severity: "high", evidence: ["now and pay"] }
      ]
    });
    expect(segments.find((segment) => segment.text.includes("pay")).kind).toBe("high");
  });
});

describe("defangUrl", () => {
  it("defangs the scheme and host only", () => {
    expect(defangUrl("https://bit.ly/a.b")).toBe("hxxps://bit[.]ly/a.b");
    expect(defangUrl("www.example.com")).toBe("www[.]example[.]com");
  });
});

describe("toApiError", () => {
  it("maps backend error codes", () => {
    const error = toApiError({ response: { status: 504, data: { error: { code: "ANALYZER_TIMEOUT" } } } });
    expect(error).toMatchObject({ code: "ANALYZER_TIMEOUT", retryable: true });
  });

  it("falls back to the HTTP status when the code is unknown", () => {
    expect(toApiError({ response: { status: 503, data: {} } }).code).toBe("ANALYZER_UNAVAILABLE");
  });

  it("maps a request with no response to an unreachable backend", () => {
    expect(toApiError({ request: {}, code: "ERR_NETWORK" }).code).toBe("BACKEND_UNREACHABLE");
  });

  it("maps a client-side timeout", () => {
    expect(toApiError({ code: "ECONNABORTED" }).code).toBe("CLIENT_TIMEOUT");
  });

  it("flags validation errors as field errors", () => {
    const error = toApiError({ response: { status: 400, data: { error: { code: "MESSAGE_TOO_LONG" } } } });
    expect(error.field).toBe(true);
  });
});
