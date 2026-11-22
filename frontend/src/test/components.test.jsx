import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import recorded from "./fixtures/partialResponse.json";
import { Report } from "../components/report/Report.jsx";
import { MessageForm } from "../components/workspace/MessageForm.jsx";
import { buildReport } from "../utils/report.js";

function renderForm(props = {}) {
  const handlers = { onChange: vi.fn(), onSubmit: vi.fn(), onErrorChange: vi.fn(), onClear: vi.fn(), onCancel: vi.fn(), onUseExample: vi.fn() };
  render(<MessageForm value="" isLoading={false} error={null} {...handlers} {...props} />);
  return handlers;
}

describe("MessageForm", () => {
  it("labels the textarea and shows the character count", () => {
    renderForm({ value: "hello" });
    expect(screen.getByLabelText("Message to check")).toHaveValue("hello");
    expect(screen.getByText(/5 \/ 10,000/)).toBeInTheDocument();
  });

  it("blocks an empty submission with an inline error instead of calling the API", async () => {
    const handlers = renderForm({ value: "   " });
    await userEvent.click(screen.getByRole("button", { name: "Analyze message" }));
    expect(handlers.onSubmit).not.toHaveBeenCalled();
    expect(handlers.onErrorChange).toHaveBeenCalledWith(expect.stringMatching(/paste the message/i));
  });

  it("blocks a message over 10,000 characters", async () => {
    const handlers = renderForm({ value: "a".repeat(10_001) });
    await userEvent.click(screen.getByRole("button", { name: "Analyze message" }));
    expect(handlers.onSubmit).not.toHaveBeenCalled();
    expect(handlers.onErrorChange).toHaveBeenCalledWith(expect.stringMatching(/1 characters over/));
  });

  it("submits with Ctrl+Enter", async () => {
    const handlers = renderForm({ value: "Pay the fee" });
    await userEvent.click(screen.getByLabelText("Message to check"));
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(handlers.onSubmit).toHaveBeenCalledWith("Pay the fee");
  });

  it("links an error to the field", () => {
    renderForm({ value: "", error: "Paste the message you received." });
    const field = screen.getByLabelText("Message to check");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(expect.stringContaining("Paste the message you received."));
  });
});

describe("Report", () => {
  it("renders a partial report honestly from a recorded response", () => {
    render(<Report report={buildReport(recorded)} completedAt={new Date()} isStale={false} />);
    expect(screen.getByText(/Partial report/)).toBeInTheDocument();
    expect(screen.getByText(String(recorded.data.riskAssessment.riskScore))).toBeInTheDocument();
    expect(screen.getByText(/The AI assessment didn’t run/)).toBeInTheDocument();
    // Links are defanged and never rendered as anchors.
    expect(screen.getByText("hxxps://bit[.]ly/abc")).toBeInTheDocument();
    expect(document.querySelector("a[href*='bit.ly']")).toBeNull();
    // A missing RDAP record is never presented as a clean result.
    expect(screen.getByText("No public registration record was found")).toBeInTheDocument();
  });
});
