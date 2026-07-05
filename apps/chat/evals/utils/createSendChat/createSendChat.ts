import { createBedrockGuardrail } from "../../../src/lambda/utils/createBedrockGuardrail/createBedrockGuardrail";
import { handleChatRequest } from "../../../src/lambda/utils/handleChatRequest/handleChatRequest";

import type { loadEvalConfig } from "../loadEvalConfig/loadEvalConfig";

import { createStubProtection } from "./utils/createStubProtection/createStubProtection";
import { createTokenRecordingModel } from "./utils/createTokenRecordingModel/createTokenRecordingModel";

export const createSendChat = (
  config: ReturnType<typeof loadEvalConfig>,
  metrics: { latencyMs: number; chatTokens: number },
) => {
  const deps = {
    model: createTokenRecordingModel({
      region: config.region,
      modelId: config.modelId,
      maxTokens: config.maxTokens,
    }),
    protection: createStubProtection(),
    guardrail: createBedrockGuardrail({
      region: config.region,
      guardrailId: config.guardrailId,
      guardrailVersion: config.guardrailVersion,
    }),
  };

  const sendChat = async (request: { content: string; pageSlug?: string }) => {
    const payload = {
      body: {
        messages: [{ role: "user", content: request.content }],
        pageSlug: request.pageSlug,
      },
    };
    const start = Date.now();
    const response = await handleChatRequest(payload, "eval", deps);

    metrics.latencyMs = Date.now() - start;
    metrics.chatTokens = deps.model.takeTokens();

    return {
      response,
      reply: response.status === 200 ? response.body.reply : "",
    };
  };

  return sendChat;
};
