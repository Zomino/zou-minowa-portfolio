import { describe, expect, it, vi } from "vitest";

import { createSendChat } from "./createSendChat";

const createTokenRecordingModel = vi.fn((_config: unknown) => ({
  generate: async () => ({ reply: "Zou is a software engineer.", tokens: 42 }),
  takeTokens: () => 42,
}));
const createBedrockGuardrail = vi.fn((_config: unknown) => ({
  inspect: async () => ({ blocked: false }),
}));

vi.mock(
  "../../../src/lambda/utils/createBedrockGuardrail/createBedrockGuardrail",
  () => ({
    createBedrockGuardrail: (config: unknown) => createBedrockGuardrail(config),
  }),
);

vi.mock("./utils/createTokenRecordingModel/createTokenRecordingModel", () => ({
  createTokenRecordingModel: (config: unknown) =>
    createTokenRecordingModel(config),
}));

const config = {
  region: "eu-west-2",
  modelId: "the-chat-model-id",
  judgeModelId: "the-judge-model-id",
  guardrailId: "the-guardrail-id",
  guardrailVersion: "3",
  maxTokens: 600,
};

const buildMetrics = () => ({ latencyMs: -1, chatTokens: 0 });

describe("createSendChat", () => {
  it("builds its dependencies from the config", () => {
    createSendChat(config, buildMetrics());

    expect(createTokenRecordingModel).toHaveBeenCalledWith({
      region: "eu-west-2",
      modelId: "the-chat-model-id",
      maxTokens: 600,
    });
    expect(createBedrockGuardrail).toHaveBeenCalledWith({
      region: "eu-west-2",
      guardrailId: "the-guardrail-id",
      guardrailVersion: "3",
    });
  });

  it("returns the response and records the latency and token usage", async () => {
    const metrics = buildMetrics();
    const sendChat = createSendChat(config, metrics);

    const { response, reply } = await sendChat({
      content: "Who is Zou Minowa?",
    });

    expect(response).toEqual({
      status: 200,
      body: { reply: "Zou is a software engineer." },
    });
    expect(reply).toBe("Zou is a software engineer.");
    expect(metrics.latencyMs).toBeGreaterThanOrEqual(0);
    expect(metrics.chatTokens).toBe(42);
  });
});
