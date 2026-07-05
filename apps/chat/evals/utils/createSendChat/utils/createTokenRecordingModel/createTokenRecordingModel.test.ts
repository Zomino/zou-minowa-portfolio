import { describe, expect, it, vi } from "vitest";

import { createTokenRecordingModel } from "./createTokenRecordingModel";

const generate = vi.fn(async () => ({ reply: "a reply", tokens: 7 }));
const createBedrockChatModel = vi.fn((_config: unknown) => ({ generate }));

vi.mock(
  "../../../../../src/lambda/utils/createBedrockChatModel/createBedrockChatModel",
  () => ({
    createBedrockChatModel: (config: unknown) => createBedrockChatModel(config),
  }),
);

const config = { region: "eu-west-2", modelId: "the-model-id", maxTokens: 600 };

const args = {
  systemPrompt: "Stay on topic.",
  messages: [{ role: "user" as const, content: "hi" }],
};

describe("createTokenRecordingModel", () => {
  it("constructs the underlying model with the given config", () => {
    createTokenRecordingModel(config);

    expect(createBedrockChatModel).toHaveBeenCalledWith(config);
  });

  it("passes the call through to the wrapped model", async () => {
    const model = createTokenRecordingModel(config);

    await expect(model.generate(args)).resolves.toEqual({
      reply: "a reply",
      tokens: 7,
    });
    expect(generate).toHaveBeenCalledWith(args);
  });

  it("accumulates tokens across calls and resets when taken", async () => {
    const model = createTokenRecordingModel(config);

    await model.generate(args);
    await model.generate(args);

    expect(model.takeTokens()).toBe(14);
    expect(model.takeTokens()).toBe(0);
  });
});
