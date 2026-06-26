import type { APIGatewayProxyEventV2 } from "aws-lambda";

import { handleChatRequest } from "./utils/handleChatRequest";
import { createBedrockChatModel } from "./utils/createBedrockChatModel";

const DEFAULT_MODEL_ID = "eu.anthropic.claude-haiku-4-5-20251001-v1:0";
const DEFAULT_MAX_OUTPUT_TOKENS = 600;

const requireEnv = (key: string) => {
  const value = process.env[key];

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const decodeBody = (
  body: string | undefined,
  isBase64Encoded: boolean,
) => {
  if (body === undefined) {
    return null;
  }

  return isBase64Encoded
    ? Buffer.from(body, "base64").toString("utf8")
    : body;
};

export const handler = async (event: APIGatewayProxyEventV2) => {
  const config = {
    region: requireEnv("AWS_REGION"),
    modelId: process.env["CHAT_MODEL_ID"] ?? DEFAULT_MODEL_ID,
    maxTokens: DEFAULT_MAX_OUTPUT_TOKENS,
  };
  const model = createBedrockChatModel(config);

  const decoded = decodeBody(event.body, event.isBase64Encoded ?? false);
  const outcome = await handleChatRequest(decoded, { model });

  return {
    statusCode: outcome.status,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(outcome.body),
  };
};
