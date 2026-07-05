import { describe, expect, it, vi } from "vitest";

import { createAssess } from "./createAssess";

const parse = vi.fn();
const construct = vi.fn();

vi.mock("@anthropic-ai/bedrock-sdk", () => ({
  default: class {
    constructor(options: unknown) {
      construct(options);
    }
    messages = { parse };
  },
}));

const config = { region: "eu-west-2", modelId: "the-judge-model-id" };

const input = {
  criteria: "The reply mentions Strapi.",
  groundTruth: "Strapi runs as the CMS backend.",
  reply: "The painter portfolio uses Strapi as its CMS.",
};

const buildMetrics = () => ({ judgeTokens: 0 });

describe("createAssess", () => {
  it("returns the parsed verdict and records the token usage", async () => {
    parse.mockResolvedValue({
      parsed_output: {
        verdict: "pass",
        reasoning: "The reply mentions Strapi.",
      },
      usage: { input_tokens: 100, output_tokens: 20 },
    });
    const metrics = buildMetrics();

    const verdict = await createAssess(config, metrics)(input);

    expect(verdict).toEqual({
      verdict: "pass",
      reasoning: "The reply mentions Strapi.",
    });
    expect(metrics.judgeTokens).toBe(120);
  });

  it("prompts the judge model with the criteria, ground truth and reply", async () => {
    parse.mockResolvedValue({
      parsed_output: { verdict: "fail", reasoning: "x" },
      usage: { input_tokens: 1, output_tokens: 1 },
    });

    await createAssess(config, buildMetrics())(input);

    const call = parse.mock.calls.at(-1)?.[0];
    expect(call.model).toBe("the-judge-model-id");
    expect(call.system).toContain("strict evaluator");
    expect(call.messages[0].content).toContain(input.criteria);
    expect(call.messages[0].content).toContain(input.groundTruth);
    expect(call.messages[0].content).toContain(input.reply);
  });

  it("constrains the output to the verdict schema", async () => {
    parse.mockResolvedValue({
      parsed_output: { verdict: "fail", reasoning: "x" },
      usage: { input_tokens: 1, output_tokens: 1 },
    });

    await createAssess(config, buildMetrics())(input);

    const call = parse.mock.calls.at(-1)?.[0];
    expect(call.output_config.format.type).toBe("json_schema");
  });

  it("fails safely when the response could not be parsed", async () => {
    parse.mockResolvedValue({
      parsed_output: null,
      usage: { input_tokens: 10, output_tokens: 10 },
    });
    const metrics = buildMetrics();

    const verdict = await createAssess(config, metrics)(input);

    expect(verdict).toEqual({
      verdict: "fail",
      reasoning: "The judge output could not be parsed.",
    });
    expect(metrics.judgeTokens).toBe(20);
  });

  it("constructs the client for the configured region", async () => {
    createAssess(config, buildMetrics());

    expect(construct).toHaveBeenCalledWith({ awsRegion: "eu-west-2" });
  });
});
