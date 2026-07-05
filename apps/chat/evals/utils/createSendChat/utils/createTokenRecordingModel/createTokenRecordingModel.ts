import type { BedrockChatModelConfig } from "../../../../../src/lambda/utils/createBedrockChatModel/createBedrockChatModel";
import { createBedrockChatModel } from "../../../../../src/lambda/utils/createBedrockChatModel/createBedrockChatModel";
import type { ChatModel } from "../../../../../src/lambda/utils/handleChatRequest/handleChatRequest";

export const createTokenRecordingModel = (config: BedrockChatModelConfig) => {
  const model = createBedrockChatModel(config);

  let recordedTokens = 0;

  const generate: ChatModel["generate"] = async (args) => {
    const result = await model.generate(args);

    recordedTokens += result.tokens;

    return result;
  };

  const takeTokens = () => {
    const taken = recordedTokens;

    recordedTokens = 0;

    return taken;
  };

  return { generate, takeTokens };
};
