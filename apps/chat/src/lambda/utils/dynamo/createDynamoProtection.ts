import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import type { ChatProtection, ProtectionVerdict } from "../handleChatRequest";

export interface DynamoProtectionConfig {
  region: string;
  tableName: string;
  requestsPerWindow: number;
  windowMs: number;
  dailyTokenBudget: number;
}

const BUDGET_RETENTION_SECONDS = 2 * 24 * 60 * 60;

type RateGate = (
  client: DynamoDBDocumentClient,
  config: DynamoProtectionConfig,
  clientId: string,
) => Promise<ProtectionVerdict | null>;

type BudgetGate = (
  client: DynamoDBDocumentClient,
  config: DynamoProtectionConfig,
) => Promise<ProtectionVerdict | null>;

type CheckLimits = (
  client: DynamoDBDocumentClient,
  config: DynamoProtectionConfig,
  clientId: string,
) => Promise<ProtectionVerdict>;

type RecordSpend = (
  client: DynamoDBDocumentClient,
  config: DynamoProtectionConfig,
  args: { tokens: number },
) => Promise<void>;

const consumeRateSlot: RateGate = async (client, config, clientId) => {
  const now = Date.now();
  const windowStart = Math.floor(now / config.windowMs) * config.windowMs;

  const rate = await client.send(
    new UpdateCommand({
      TableName: config.tableName,
      Key: { id: `rate#${clientId}#${windowStart}` },
      UpdateExpression: "SET expiresAt = :expiresAt ADD hits :one",
      ExpressionAttributeValues: {
        ":expiresAt": Math.floor((windowStart + config.windowMs) / 1000),
        ":one": 1,
      },
      ReturnValues: "ALL_NEW",
    }),
  );

  const hits = Number(rate.Attributes?.["hits"] ?? 0);
  if (hits > config.requestsPerWindow) {
    return {
      allowed: false,
      reason: "rate_limited",
      retryAfterMs: windowStart + config.windowMs - now,
    };
  }

  return null;
};

const checkBudget: BudgetGate = async (client, config) => {
  const day = new Date(Date.now()).toISOString().slice(0, 10);

  const budget = await client.send(
    new GetCommand({
      TableName: config.tableName,
      Key: { id: `budget#${day}` },
    }),
  );

  const spent = Number(budget.Item?.["tokens"] ?? 0);
  if (spent >= config.dailyTokenBudget) {
    return { allowed: false, reason: "budget_exhausted" };
  }

  return null;
};

const checkLimits: CheckLimits = async (client, config, clientId) => {
  const rateLimited = await consumeRateSlot(client, config, clientId);
  if (rateLimited !== null) {
    return rateLimited;
  }

  const budgetExhausted = await checkBudget(client, config);
  if (budgetExhausted !== null) {
    return budgetExhausted;
  }

  return { allowed: true };
};

const recordSpend: RecordSpend = async (client, config, { tokens }) => {
  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);

  await client.send(
    new UpdateCommand({
      TableName: config.tableName,
      Key: { id: `budget#${day}` },
      UpdateExpression: "SET expiresAt = :expiresAt ADD tokens :tokens",
      ExpressionAttributeValues: {
        ":expiresAt": Math.floor(now / 1000) + BUDGET_RETENTION_SECONDS,
        ":tokens": tokens,
      },
    }),
  );
};

let protection: ChatProtection | null = null;

export const createDynamoProtection = (config: DynamoProtectionConfig) => {
  if (protection !== null) {
    return protection;
  }

  const client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: config.region }),
  );

  const built: ChatProtection = {
    check: (clientId) => checkLimits(client, config, clientId),
    record: (args) => recordSpend(client, config, args),
  };

  protection = built;
  return built;
};
