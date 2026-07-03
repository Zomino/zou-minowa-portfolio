import { beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("@aws-sdk/client-bedrock-runtime", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@aws-sdk/client-bedrock-runtime")>();
  return {
    ...actual,
    BedrockRuntimeClient: class {
      send = send;
    },
  };
});

const config = {
  region: "eu-west-2",
  guardrailId: "gr-123",
  guardrailVersion: "1",
};

const load = async () =>
  (await import("./createBedrockGuardrail")).createBedrockGuardrail;

beforeEach(() => {
  vi.resetModules();
  send.mockReset();
});

describe("createBedrockGuardrail", () => {
  it("reports blocked when the guardrail intervenes", async () => {
    send.mockResolvedValueOnce({ action: "GUARDRAIL_INTERVENED" });
    const createBedrockGuardrail = await load();

    const verdict = await createBedrockGuardrail(config).inspect({
      text: "something",
      source: "input",
    });

    expect(verdict).toEqual({ blocked: true });
  });

  it("reports not blocked when the action is none", async () => {
    send.mockResolvedValueOnce({ action: "NONE" });
    const createBedrockGuardrail = await load();

    const verdict = await createBedrockGuardrail(config).inspect({
      text: "something",
      source: "output",
    });

    expect(verdict).toEqual({ blocked: false });
  });

  it("sends the text and maps the source to the Bedrock enum", async () => {
    send.mockResolvedValueOnce({ action: "NONE" });
    const createBedrockGuardrail = await load();

    await createBedrockGuardrail(config).inspect({
      text: "inspect me",
      source: "output",
    });

    const input = send.mock.calls[0]?.[0].input;
    expect(input.guardrailIdentifier).toBe("gr-123");
    expect(input.guardrailVersion).toBe("1");
    expect(input.source).toBe("OUTPUT");
    expect(input.content).toEqual([{ text: { text: "inspect me" } }]);
  });
});
