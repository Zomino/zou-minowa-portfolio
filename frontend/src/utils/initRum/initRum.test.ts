import { afterEach, describe, expect, it, vi } from "vitest";

const { awsRum } = vi.hoisted(() => ({
  awsRum: vi.fn(function AwsRum() {}),
}));

vi.mock("aws-rum-web", () => ({ AwsRum: awsRum }));

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

async function loadInitRum(env: {
  appMonitorId?: string;
  identityPoolId?: string;
}) {
  vi.doMock("astro:env/client", () => ({
    PUBLIC_RUM_APP_MONITOR_ID: env.appMonitorId,
    PUBLIC_RUM_IDENTITY_POOL_ID: env.identityPoolId,
  }));
  const { initRum } = await import("./initRum");
  return initRum;
}

describe("initRum", () => {
  it("does nothing when no RUM config is injected", async () => {
    const initRum = await loadInitRum({});

    await initRum();

    expect(awsRum).not.toHaveBeenCalled();
  });

  it("initialises the RUM web client with the injected config", async () => {
    const initRum = await loadInitRum({
      appMonitorId: "bede3e86-80a8-4cc3-b796-b2efa305ffe3",
      identityPoolId: "eu-west-2:3d742b5d-451a-4245-9b8b-fde1f82824e5",
    });

    await initRum();

    expect(awsRum).toHaveBeenCalledWith(
      "bede3e86-80a8-4cc3-b796-b2efa305ffe3",
      "1.0.0",
      "eu-west-2",
      expect.objectContaining({
        sessionSampleRate: 1,
        identityPoolId: "eu-west-2:3d742b5d-451a-4245-9b8b-fde1f82824e5",
        endpoint: "https://dataplane.rum.eu-west-2.amazonaws.com",
        telemetries: ["performance", "errors", "http"],
        allowCookies: true,
        enableXRay: false,
      }),
    );
  });

  it("does not throw if the RUM client fails to initialise", async () => {
    const initRum = await loadInitRum({
      appMonitorId: "app-monitor-id",
      identityPoolId: "identity-pool-id",
    });
    awsRum.mockImplementationOnce(function AwsRum() {
      throw new Error("init failed");
    });

    await expect(initRum()).resolves.toBeUndefined();
  });
});
