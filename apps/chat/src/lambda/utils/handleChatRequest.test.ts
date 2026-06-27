import { describe, expect, it, vi } from "vitest";

import type {
  ChatGuardrail,
  ChatModel,
  ChatProtection,
} from "./handleChatRequest";
import { handleChatRequest } from "./handleChatRequest";
import { PORTFOLIO } from "./portfolio";

const CLIENT_ID = "203.0.113.5";

const modelReturning = (reply: string, tokens = 0): ChatModel => ({
  generate: vi.fn(async () => ({ reply, tokens })),
});

const allowingProtection = (): ChatProtection => ({
  check: vi.fn<ChatProtection["check"]>(async () => ({ allowed: true })),
  record: vi.fn(async () => {}),
});

const allowingGuardrail = (): ChatGuardrail => ({
  inspect: vi.fn(async () => ({ blocked: false })),
});

const guardrailBlocking = (
  blockedSource: "input" | "output",
): ChatGuardrail => ({
  inspect: vi.fn<ChatGuardrail["inspect"]>(async ({ source }) => ({
    blocked: source === blockedSource,
  })),
});

const validPayload = {
  body: { messages: [{ role: "user", content: "What does Zou build?" }] },
};

describe("handleChatRequest", () => {
  it("returns a 200 outcome and records the tokens spent on success", async () => {
    const model = modelReturning("Zou builds maintainable products.", 42);
    const protection = allowingProtection();

    const outcome = await handleChatRequest(validPayload, CLIENT_ID, {
      model,
      protection,
      guardrail: allowingGuardrail(),
    });

    expect(outcome).toEqual({
      status: 200,
      body: { reply: "Zou builds maintainable products." },
    });
    expect(model.generate).toHaveBeenCalledWith({
      systemPrompt: expect.stringContaining(PORTFOLIO.name),
      messages: [{ role: "user", content: "What does Zou build?" }],
    });
    expect(protection.record).toHaveBeenCalledWith({ tokens: 42 });
  });

  it("returns 400 invalid_request when the body fails the contract", async () => {
    const model = modelReturning("unused");
    const protection = allowingProtection();

    const outcome = await handleChatRequest({ body: { messages: [] } }, CLIENT_ID, {
      model,
      protection,
      guardrail: allowingGuardrail(),
    });

    expect(outcome.status).toBe(400);
    expect(outcome.body).toEqual({
      reason: "invalid_request",
      message: expect.any(String),
    });
    expect(protection.check).not.toHaveBeenCalled();
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("returns 400 invalid_request for a non object payload", async () => {
    const model = modelReturning("unused");

    const outcome = await handleChatRequest("not an object", CLIENT_ID, {
      model,
      protection: allowingProtection(),
      guardrail: allowingGuardrail(),
    });

    expect(outcome.status).toBe(400);
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("returns 400 invalid_request for a missing body", async () => {
    const model = modelReturning("unused");

    const outcome = await handleChatRequest(null, CLIENT_ID, {
      model,
      protection: allowingProtection(),
      guardrail: allowingGuardrail(),
    });

    expect(outcome.status).toBe(400);
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("returns 400 blocked when the guardrail blocks the input", async () => {
    const model = modelReturning("unused");

    const outcome = await handleChatRequest(validPayload, CLIENT_ID, {
      model,
      protection: allowingProtection(),
      guardrail: guardrailBlocking("input"),
    });

    expect(outcome.status).toBe(400);
    expect(outcome.body).toEqual({
      reason: "blocked",
      message: expect.any(String),
    });
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("returns a safe 200 fallback when the guardrail blocks the output", async () => {
    const model = modelReturning("disallowed reply", 42);
    const protection = allowingProtection();

    const outcome = await handleChatRequest(validPayload, CLIENT_ID, {
      model,
      protection,
      guardrail: guardrailBlocking("output"),
    });

    expect(outcome.status).toBe(200);
    if (outcome.status === 200) {
      expect(outcome.body.reply).not.toBe("disallowed reply");
      expect(outcome.body.reply).toEqual(expect.any(String));
    }
    expect(protection.record).toHaveBeenCalledWith({ tokens: 42 });
  });

  it("returns 429 rate_limited with the retry delay when the limit is hit", async () => {
    const model = modelReturning("unused");
    const protection: ChatProtection = {
      check: vi.fn<ChatProtection["check"]>(async () => ({
        allowed: false,
        reason: "rate_limited",
        retryAfterMs: 5000,
      })),
      record: vi.fn(async () => {}),
    };

    const outcome = await handleChatRequest(validPayload, CLIENT_ID, {
      model,
      protection,
      guardrail: allowingGuardrail(),
    });

    expect(outcome).toEqual({
      status: 429,
      body: {
        reason: "rate_limited",
        message: expect.any(String),
        retryAfterMs: 5000,
      },
    });
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("returns 503 budget_exhausted when the budget is spent", async () => {
    const model = modelReturning("unused");
    const protection: ChatProtection = {
      check: vi.fn<ChatProtection["check"]>(async () => ({
        allowed: false,
        reason: "budget_exhausted",
      })),
      record: vi.fn(async () => {}),
    };

    const outcome = await handleChatRequest(validPayload, CLIENT_ID, {
      model,
      protection,
      guardrail: allowingGuardrail(),
    });

    expect(outcome.status).toBe(503);
    expect(outcome.body).toEqual({
      reason: "budget_exhausted",
      message: expect.any(String),
    });
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("fails closed with 503 unavailable when the protection store errors", async () => {
    const model = modelReturning("unused");
    const protection: ChatProtection = {
      check: vi.fn(async () => {
        throw new Error("dynamodb down");
      }),
      record: vi.fn(async () => {}),
    };

    const outcome = await handleChatRequest(validPayload, CLIENT_ID, {
      model,
      protection,
      guardrail: allowingGuardrail(),
    });

    expect(outcome.status).toBe(503);
    expect(outcome.body).toEqual({
      reason: "unavailable",
      message: expect.any(String),
    });
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("returns a 503 unavailable outcome when the model fails", async () => {
    const model: ChatModel = {
      generate: vi.fn(async () => {
        throw new Error("bedrock down");
      }),
    };

    const outcome = await handleChatRequest(validPayload, CLIENT_ID, {
      model,
      protection: allowingProtection(),
      guardrail: allowingGuardrail(),
    });

    expect(outcome.status).toBe(503);
    expect(outcome.body).toEqual({
      reason: "unavailable",
      message: expect.any(String),
    });
  });
});
