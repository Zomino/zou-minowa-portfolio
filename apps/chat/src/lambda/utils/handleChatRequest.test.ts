import { describe, expect, it, vi } from "vitest";

import type { ChatModel } from "./handleChatRequest";
import { handleChatRequest } from "./handleChatRequest";

const modelReturning = (reply: string): ChatModel => ({
  generate: vi.fn(async () => ({ reply })),
});

const validBody = JSON.stringify({
  body: { messages: [{ role: "user", content: "What does Zou build?" }] },
});

describe("handleChatRequest", () => {
  it("returns a 200 outcome with the contract response on success", async () => {
    const model = modelReturning("Zou builds maintainable products.");

    const outcome = await handleChatRequest(validBody, { model });

    expect(outcome).toEqual({
      status: 200,
      body: { reply: "Zou builds maintainable products." },
    });
    expect(model.generate).toHaveBeenCalledWith({
      messages: [{ role: "user", content: "What does Zou build?" }],
    });
  });

  it("returns 400 invalid_request when the body fails the contract", async () => {
    const model = modelReturning("unused");

    const outcome = await handleChatRequest(
      JSON.stringify({ body: { messages: [] } }),
      { model },
    );

    expect(outcome.status).toBe(400);
    expect(outcome.body).toEqual({
      reason: "invalid_request",
      message: expect.any(String),
    });
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("returns 400 invalid_request for a non json body", async () => {
    const model = modelReturning("unused");

    const outcome = await handleChatRequest("not json", { model });

    expect(outcome.status).toBe(400);
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("returns 400 invalid_request for a missing body", async () => {
    const model = modelReturning("unused");

    const outcome = await handleChatRequest(null, { model });

    expect(outcome.status).toBe(400);
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("returns a 503 unavailable outcome when the model fails", async () => {
    const model: ChatModel = {
      generate: vi.fn(async () => {
        throw new Error("bedrock down");
      }),
    };

    const outcome = await handleChatRequest(validBody, { model });

    expect(outcome.status).toBe(503);
    expect(outcome.body).toEqual({
      reason: "unavailable",
      message: expect.any(String),
    });
  });
});
