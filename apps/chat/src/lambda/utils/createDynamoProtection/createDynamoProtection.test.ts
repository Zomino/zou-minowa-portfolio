import { beforeEach, describe, expect, it, vi } from "vitest";

const { send, from } = vi.hoisted(() => {
  const send = vi.fn();
  return { send, from: vi.fn(() => ({ send })) };
});

vi.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: class {},
}));

vi.mock("@aws-sdk/lib-dynamodb", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aws-sdk/lib-dynamodb")>();
  return { ...actual, DynamoDBDocumentClient: { from } };
});

const config = {
  region: "eu-west-2",
  tableName: "chat-protection",
  requestsPerWindow: 10,
  windowMs: 60_000,
  dailyTokenBudget: 1000,
};

const load = async () =>
  (await import("./createDynamoProtection")).createDynamoProtection;

beforeEach(() => {
  vi.resetModules();
  send.mockReset();
  from.mockClear();
});

describe("createDynamoProtection", () => {
  it("allows a request that is under both limits", async () => {
    send.mockResolvedValueOnce({ Attributes: { hits: 1 } });
    send.mockResolvedValueOnce({ Item: { tokens: 0 } });
    const createDynamoProtection = await load();

    const verdict = await createDynamoProtection(config).check("1.2.3.4");

    expect(verdict).toEqual({ allowed: true });
  });

  it("rate limits once the window count exceeds the cap", async () => {
    send.mockResolvedValueOnce({ Attributes: { hits: 11 } });
    const createDynamoProtection = await load();

    const verdict = await createDynamoProtection(config).check("1.2.3.4");

    expect(verdict).toEqual({
      allowed: false,
      reason: "rate_limited",
      retryAfterMs: expect.any(Number),
    });
  });

  it("reports budget_exhausted when the daily tokens are spent", async () => {
    send.mockResolvedValueOnce({ Attributes: { hits: 1 } });
    send.mockResolvedValueOnce({ Item: { tokens: 1000 } });
    const createDynamoProtection = await load();

    const verdict = await createDynamoProtection(config).check("1.2.3.4");

    expect(verdict).toEqual({ allowed: false, reason: "budget_exhausted" });
  });

  it("keys the rate limit by client id against the configured table", async () => {
    send.mockResolvedValueOnce({ Attributes: { hits: 1 } });
    send.mockResolvedValueOnce({ Item: { tokens: 0 } });
    const createDynamoProtection = await load();

    await createDynamoProtection(config).check("9.9.9.9");

    const rateInput = send.mock.calls[0]?.[0].input;
    expect(rateInput.TableName).toBe("chat-protection");
    expect(rateInput.Key.id).toContain("9.9.9.9");
  });

  it("records spent tokens against the daily budget", async () => {
    send.mockResolvedValueOnce({});
    const createDynamoProtection = await load();

    await createDynamoProtection(config).record({ tokens: 42 });

    expect(send).toHaveBeenCalledTimes(1);
    const recordInput = send.mock.calls[0]?.[0].input;
    expect(recordInput.Key.id).toMatch(/^budget#/);
    expect(recordInput.ExpressionAttributeValues[":tokens"]).toBe(42);
  });

  it("constructs the document client once and reuses the protection", async () => {
    send.mockResolvedValue({ Attributes: { hits: 1 }, Item: { tokens: 0 } });
    const createDynamoProtection = await load();

    const first = createDynamoProtection(config);
    const second = createDynamoProtection(config);

    expect(first).toBe(second);
    expect(from).toHaveBeenCalledTimes(1);
  });
});
