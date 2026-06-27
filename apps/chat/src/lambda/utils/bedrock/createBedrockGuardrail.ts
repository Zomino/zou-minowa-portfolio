import {
  ApplyGuardrailCommand,
  BedrockRuntimeClient,
} from "@aws-sdk/client-bedrock-runtime";

import type { ChatGuardrail } from "../handleChatRequest";

export interface BedrockGuardrailConfig {
  region: string;
  guardrailId: string;
  guardrailVersion: string;
}

let guardrail: ChatGuardrail | null = null;

export const createBedrockGuardrail = (config: BedrockGuardrailConfig) => {
  if (guardrail !== null) {
    return guardrail;
  }

  const client = new BedrockRuntimeClient({ region: config.region });

  const inspect: ChatGuardrail["inspect"] = async ({ text, source }) => {
    const response = await client.send(
      new ApplyGuardrailCommand({
        guardrailIdentifier: config.guardrailId,
        guardrailVersion: config.guardrailVersion,
        source: source === "input" ? "INPUT" : "OUTPUT",
        content: [{ text: { text } }],
      }),
    );

    return { blocked: response.action === "GUARDRAIL_INTERVENED" };
  };

  const built: ChatGuardrail = { inspect };

  guardrail = built;

  return built;
};
