
import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import axios from "axios";

import app from "../src/app.js";


test("POST /api/analyze should analyze a valid message", async (t) => {

    t.mock.method(axios, "post", async () => ({
        data: {
            success: true,
            data: {
                textAnalysis: {},
                textSummary: {},
                urlAnalysis: [],
                domainAnalysis: [],
                llmAnalysis: {
                    status: "completed"
                },
                riskAssessment: {
                    score: 20,
                    level: "Low"
                }
            }
        }
    }));

    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: "Hello, we have a brand collaboration opportunity."
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.llmAnalysis.status, "completed");
    assert.deepEqual(response.body.warnings, []);
});


test("POST /api/analyze should reject a missing message", async () => {
    const response = await request(app)
        .post("/api/analyze")
        .send({});

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, "MESSAGE_REQUIRED");
});

test("POST /api/analyze should reject a non-string message", async () => {
    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: 12345
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, "INVALID_MESSAGE_TYPE");
});

test("POST /api/analyze should reject an empty message", async () => {
    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: "   "
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, "EMPTY_MESSAGE");
});

test("POST /api/analyze should reject messages exceeding 10000 characters", async () => {
    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: "a".repeat(10001)
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, "MESSAGE_TOO_LONG");
});



test("POST /api/analyze should return 503 when analyzer is unavailable", async (t) => {

    t.mock.method(axios, "post", async () => {
        throw Object.assign(new Error("Connection refused"), {
            code: "ECONNREFUSED"
        });
    });

    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: "Hello, we have a collaboration opportunity."
        });

    assert.equal(response.status, 503);
    assert.equal(response.body.error.code, "ANALYZER_UNAVAILABLE");
});

test("POST /api/analyze should return 504 when analyzer times out", async (t) => {

    t.mock.method(axios, "post", async () => {
        throw Object.assign(new Error("Request timeout"), {
            code: "ECONNABORTED"
        });
    });

    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: "Hello, we have a collaboration opportunity."
        });

    assert.equal(response.status, 504);
    assert.equal(response.body.error.code, "ANALYZER_TIMEOUT");
});

test("POST /api/analyze should return 502 when analyzer responds with an error", async (t) => {

    t.mock.method(axios, "post", async () => {
        throw Object.assign(new Error("Analyzer error"), {
            response: {
                status: 500,
                data: {
                    detail: "Internal analyzer error"
                }
            }
        });
    });

    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: "Hello, we have a collaboration opportunity."
        });

    assert.equal(response.status, 502);
    assert.equal(response.body.error.code, "ANALYZER_ERROR");
});

test("POST /api/analyze should return 500 for unexpected errors", async (t) => {

    t.mock.method(axios, "post", async () => {
        throw new Error("Unexpected error");
    });

    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: "Hello, we have a collaboration opportunity."
        });

    assert.equal(response.status, 500);
    assert.equal(response.body.error.code, "INTERNAL_SERVER_ERROR");
});


test("POST /api/analyze should return a warning when Gemini is unavailable", async (t) => {

    t.mock.method(axios, "post", async () => ({
        data: {
            data: {
                textAnalysis: {},
                textSummary: {},
                urlAnalysis: [],
                domainAnalysis: [],
                llmAnalysis: {
                    status: "unavailable"
                },
                riskAssessment: {
                    score: 30,
                    level: "Medium"
                }
            }
        }
    }));

    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: "Brand collaboration opportunity."
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.warnings.length, 1);
    assert.equal(response.body.warnings[0].component, "llm");
});

test("POST /api/analyze should return a warning when RDAP is unavailable", async (t) => {

    t.mock.method(axios, "post", async () => ({
        data: {
            data: {
                textAnalysis: {},
                textSummary: {},
                urlAnalysis: [],
                domainAnalysis: [
                    {
                        domain: "example.com",
                        status: "unavailable"
                    }
                ],
                llmAnalysis: {
                    status: "completed"
                },
                riskAssessment: {
                    score: 20,
                    level: "Low"
                }
            }
        }
    }));

    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: "Brand collaboration opportunity."
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.warnings.length, 1);
    assert.equal(response.body.warnings[0].component, "domain");
    assert.equal(response.body.warnings[0].domain, "example.com");
});

test("POST /api/analyze should return a warning when RDAP is rate limited", async (t) => {

    t.mock.method(axios, "post", async () => ({
        data: {
            data: {
                textAnalysis: {},
                textSummary: {},
                urlAnalysis: [],
                domainAnalysis: [
                    {
                        domain: "example.com",
                        status: "rate_limited"
                    }
                ],
                llmAnalysis: {
                    status: "completed"
                },
                riskAssessment: {
                    score: 20,
                    level: "Low"
                }
            }
        }
    }));

    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: "Brand collaboration opportunity."
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.warnings.length, 1);
    assert.equal(response.body.warnings[0].component, "domain");
});

test("POST /api/analyze should return multiple warnings when multiple checks are unavailable", async (t) => {

    t.mock.method(axios, "post", async () => ({
        data: {
            data: {
                textAnalysis: {},
                textSummary: {},
                urlAnalysis: [
                    {
                        status: "analysis_failed"
                    }
                ],
                domainAnalysis: [
                    {
                        domain: "example.com",
                        status: "unavailable"
                    }
                ],
                llmAnalysis: {
                    status: "unavailable"
                },
                riskAssessment: {
                    score: 15,
                    level: "Low"
                }
            }
        }
    }));

    const response = await request(app)
        .post("/api/analyze")
        .send({
            message: "Brand collaboration opportunity."
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.warnings.length, 3);

    const components = response.body.warnings.map(
        (warning) => warning.component
    );

    assert.deepEqual(
        components.sort(),
        ["domain", "llm", "url"]
    );
});


test("GET /api/health should return a successful health response", async () => {

    const response = await request(app)
        .get("/api/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
});
