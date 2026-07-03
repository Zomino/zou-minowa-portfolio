import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";

import type { ChatModel } from "../handleChatRequest/handleChatRequest";

export interface BedrockChatModelConfig {
  region: string;
  modelId: string;
  maxTokens: number;
}

let model: ChatModel | null = null;

export const createBedrockChatModel = (config: BedrockChatModelConfig) => {
  if (model !== null) {
    return model;
  }

  const client = new AnthropicBedrock({ awsRegion: config.region });

  const generate: ChatModel["generate"] = async ({
    systemPrompt,
    messages,
  }) => {
    const message = await client.messages.create({
      model: config.modelId,
      max_tokens: config.maxTokens,
      system: systemPrompt,
      messages,
    });

    const reply = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");

    const tokens = message.usage.input_tokens + message.usage.output_tokens;

    return { reply, tokens };
  };

  const built: ChatModel = { generate };

  model = built;

  return built;
};
