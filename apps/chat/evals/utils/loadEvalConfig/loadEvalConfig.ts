const DEFAULT_REGION = "eu-west-2";
const DEFAULT_MODEL_ID = "eu.anthropic.claude-haiku-4-5-20251001-v1:0";
const DEFAULT_JUDGE_MODEL_ID = "eu.anthropic.claude-sonnet-4-6";
const MAX_OUTPUT_TOKENS = 600;

const requireEnv = (key: string) => {
  const value = process.env[key];

  if (value === undefined) {
    throw new Error(
      `Missing required environment variable ${key}. Read it from the terraform outputs in infra/main or from the AWS console.`,
    );
  }

  return value;
};

export const loadEvalConfig = () => ({
  region: process.env["AWS_REGION"] ?? DEFAULT_REGION,
  modelId: process.env["CHAT_MODEL_ID"] ?? DEFAULT_MODEL_ID,
  judgeModelId: process.env["EVAL_JUDGE_MODEL_ID"] ?? DEFAULT_JUDGE_MODEL_ID,
  guardrailId: requireEnv("CHAT_GUARDRAIL_ID"),
  guardrailVersion: requireEnv("CHAT_GUARDRAIL_VERSION"),
  maxTokens: MAX_OUTPUT_TOKENS,
});
