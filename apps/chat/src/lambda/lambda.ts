import type { APIGatewayProxyEventV2 } from "aws-lambda";

import { handleChatRequest } from "./utils/handleChatRequest";
import { createBedrockChatModel } from "./utils/bedrock/createBedrockChatModel";
import { createBedrockGuardrail } from "./utils/bedrock/createBedrockGuardrail";
import { createDynamoProtection } from "./utils/dynamo/createDynamoProtection";

const DEFAULT_MODEL_ID = "eu.anthropic.claude-haiku-4-5-20251001-v1:0";
const DEFAULT_MAX_OUTPUT_TOKENS = 600;
const DEFAULT_REQUESTS_PER_WINDOW = 20;
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_DAILY_TOKEN_BUDGET = 1_000_000;

const requireEnv = (key: string) => {
  const value = process.env[key];

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const clientIdFrom = (
  forwardedFor: string | undefined,
  sourceIp: string,
) => {
  const lastHop = forwardedFor?.split(",").at(-1)?.trim();

  return lastHop ?? sourceIp;
};

export const decodeBody = (body: string | undefined, isBase64Encoded = false) => {
  if (body === undefined) {
    return null;
  }

  return isBase64Encoded
    ? Buffer.from(body, "base64").toString("utf8")
    : body;
};

export const parseJson = (body: string | null) => {
  try {
    return JSON.parse(body ?? "");
  } catch {
    return null;
  }
};

export const handler = async (event: APIGatewayProxyEventV2) => {
  const region = requireEnv("AWS_REGION");

  const model = createBedrockChatModel({
    region,
    modelId: process.env["CHAT_MODEL_ID"] ?? DEFAULT_MODEL_ID,
    maxTokens: DEFAULT_MAX_OUTPUT_TOKENS,
  });

  const protection = createDynamoProtection({
    region,
    tableName: requireEnv("CHAT_TABLE_NAME"),
    requestsPerWindow: DEFAULT_REQUESTS_PER_WINDOW,
    windowMs: DEFAULT_WINDOW_MS,
    dailyTokenBudget: DEFAULT_DAILY_TOKEN_BUDGET,
  });

  const guardrail = createBedrockGuardrail({
    region,
    guardrailId: requireEnv("CHAT_GUARDRAIL_ID"),
    guardrailVersion: requireEnv("CHAT_GUARDRAIL_VERSION"),
  });

  const clientId = clientIdFrom(
    event.headers["x-forwarded-for"],
    event.requestContext.http.sourceIp,
  );
  const decoded = decodeBody(event.body, event.isBase64Encoded);
  const payload = parseJson(decoded);
  const outcome = await handleChatRequest(payload, clientId, {
    model,
    protection,
    guardrail,
  });

  return {
    statusCode: outcome.status,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(outcome.body),
  };
};
