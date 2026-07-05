import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const JUDGE_MAX_TOKENS = 300;

const JUDGE_SYSTEM_PROMPT =
  "You are a strict evaluator of replies from a chatbot that represents the portfolio of Zou Minowa, a software engineer. Judge whether the reply satisfies the given criteria, using the ground truth as the reference.";

const judgeVerdictSchema = z.object({
  verdict: z.enum(["pass", "fail"]),
  reasoning: z.string(),
});

interface JudgeInput {
  criteria: string;
  groundTruth: string;
  reply: string;
}

const buildJudgePrompt = ({ criteria, groundTruth, reply }: JudgeInput) =>
  [
    `Criteria the reply must satisfy. ${criteria}`,
    `Ground truth.\n"""\n${groundTruth}\n"""`,
    `Assistant reply to evaluate.\n"""\n${reply}\n"""`,
  ].join("\n\n");

export const createAssess = (
  config: { region: string; modelId: string },
  metrics: { judgeTokens: number },
) => {
  const client = new AnthropicBedrock({ awsRegion: config.region });

  const assess = async (input: JudgeInput) => {
    const message = await client.messages.parse({
      model: config.modelId,
      max_tokens: JUDGE_MAX_TOKENS,
      system: JUDGE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildJudgePrompt(input) }],
      output_config: { format: zodOutputFormat(judgeVerdictSchema) },
    });

    metrics.judgeTokens =
      message.usage.input_tokens + message.usage.output_tokens;

    const verdict: z.infer<typeof judgeVerdictSchema> =
      message.parsed_output ?? {
        verdict: "fail",
        reasoning: "The judge output could not be parsed.",
      };

    return verdict;
  };

  return assess;
};
