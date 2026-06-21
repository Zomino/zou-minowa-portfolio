import type { AwsRumConfig } from "aws-rum-web";
import {
  PUBLIC_RUM_APP_MONITOR_ID,
  PUBLIC_RUM_IDENTITY_POOL_ID,
} from "astro:env/client";

const RUM_REGION = "eu-west-2";
const APPLICATION_VERSION = "1.0.0";

export async function initRum(): Promise<void> {
  if (!PUBLIC_RUM_APP_MONITOR_ID || !PUBLIC_RUM_IDENTITY_POOL_ID) {
    return;
  }

  const config: AwsRumConfig = {
    sessionSampleRate: 1,
    identityPoolId: PUBLIC_RUM_IDENTITY_POOL_ID,
    endpoint: `https://dataplane.rum.${RUM_REGION}.amazonaws.com`,
    telemetries: ["performance", "errors", "http"],
    allowCookies: true,
    enableXRay: false,
  };

  try {
    const { AwsRum } = await import("aws-rum-web");
    new AwsRum(
      PUBLIC_RUM_APP_MONITOR_ID,
      APPLICATION_VERSION,
      RUM_REGION,
      config,
    );
  } catch {
    return;
  }
}
