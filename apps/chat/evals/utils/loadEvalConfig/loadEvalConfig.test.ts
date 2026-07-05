import { afterEach, describe, expect, it, vi } from "vitest";

import { loadEvalConfig } from "./loadEvalConfig";

const stubGuardrailEnv = () => {
  vi.stubEnv("CHAT_GUARDRAIL_ID", "the-guardrail-id");
  vi.stubEnv("CHAT_GUARDRAIL_VERSION", "3");
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("loadEvalConfig", () => {
  it("applies defaults when only the guardrail variables are set", () => {
    vi.stubEnv("AWS_REGION", undefined);
    vi.stubEnv("CHAT_MODEL_ID", undefined);
    vi.stubEnv("EVAL_JUDGE_MODEL_ID", undefined);
    stubGuardrailEnv();

    const config = loadEvalConfig();

    expect(config).toEqual({
      region: "eu-west-2",
      modelId: "eu.anthropic.claude-haiku-4-5-20251001-v1:0",
      judgeModelId: "eu.anthropic.claude-sonnet-4-6",
      guardrailId: "the-guardrail-id",
      guardrailVersion: "3",
      maxTokens: 600,
    });
  });

  it("prefers the environment over the defaults", () => {
    vi.stubEnv("AWS_REGION", "us-east-1");
    vi.stubEnv("CHAT_MODEL_ID", "a-chat-model");
    vi.stubEnv("EVAL_JUDGE_MODEL_ID", "a-judge-model");
    stubGuardrailEnv();

    const config = loadEvalConfig();

    expect(config.region).toBe("us-east-1");
    expect(config.modelId).toBe("a-chat-model");
    expect(config.judgeModelId).toBe("a-judge-model");
  });

  it("throws when a guardrail variable is missing", () => {
    vi.stubEnv("CHAT_GUARDRAIL_ID", undefined);
    vi.stubEnv("CHAT_GUARDRAIL_VERSION", "3");

    expect(() => loadEvalConfig()).toThrowError(/CHAT_GUARDRAIL_ID/);
  });
});
