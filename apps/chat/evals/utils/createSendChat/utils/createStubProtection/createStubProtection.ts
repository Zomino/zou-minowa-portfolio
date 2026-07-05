import type { ChatProtection } from "../../../../../src/lambda/utils/handleChatRequest/handleChatRequest";

export const createStubProtection = () => {
  const check: ChatProtection["check"] = async () => ({ allowed: true });
  const record: ChatProtection["record"] = async () => {};

  const protection: ChatProtection = { check, record };

  return protection;
};
