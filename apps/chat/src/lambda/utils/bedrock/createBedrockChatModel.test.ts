import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const construct = vi.fn();

vi.mock("@anthropic-ai/bedrock-sdk", () => ({
  default: class {
    constructor(options: unknown) {
      construct(options);
    }
    messages = { create };
  },
}));

const config = { region: "eu-west-2", modelId: "the-model-id", maxTokens: 321 };

const load = async () =>
  (await import("./createBedrockChatModel")).createBedrockChatModel;

beforeEach(() => {
  vi.resetModules();
  create.mockReset();
  construct.mockReset();
});

describe("createBedrockChatModel", () => {
  it("joins the returned text blocks into a single reply", async () => {
    create.mockResolvedValue({
      content: [
        { type: "text", text: "Zou builds " },
        { type: "tool_use", id: "x", name: "y", input: {} },
        { type: "text", text: "maintainable products." },
      ],
      usage: { input_tokens: 10, output_tokens: 5 },
    });
    const createBedrockChatModel = await load();

    const { reply, tokens } = await createBedrockChatModel(config).generate({
      systemPrompt: "Be helpful.",
      messages: [{ role: "user", content: "What does Zou build?" }],
    });

    expect(reply).toBe("Zou builds maintainable products.");
    expect(tokens).toBe(15);
  });

  it("calls the model with its id, token cap and messages", async () => {
    create.mockResolvedValue({
      content: [{ type: "text", text: "ok" }],
      usage: { input_tokens: 1, output_tokens: 1 },
    });
    const createBedrockChatModel = await load();

    await createBedrockChatModel(config).generate({
      systemPrompt: "Stay on topic.",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(create).toHaveBeenCalledWith({
      model: "the-model-id",
      max_tokens: 321,
      system: "Stay on topic.",
      messages: [{ role: "user", content: "hi" }],
    });
  });

  it("constructs the client once and reuses the model", async () => {
    create.mockResolvedValue({
      content: [{ type: "text", text: "ok" }],
      usage: { input_tokens: 1, output_tokens: 1 },
    });
    const createBedrockChatModel = await load();

    const first = createBedrockChatModel(config);
    const second = createBedrockChatModel(config);

    expect(first).toBe(second);
    expect(construct).toHaveBeenCalledTimes(1);
  });
});
