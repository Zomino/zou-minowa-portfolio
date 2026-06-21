import type { AwsRum as AwsRumClient, AwsRumConfig } from "aws-rum-web";
import {
  PUBLIC_RUM_APP_MONITOR_ID,
  PUBLIC_RUM_IDENTITY_POOL_ID,
} from "astro:env/client";
import { outboundClickEvent } from "../outboundClickEvent/outboundClickEvent";

const RUM_REGION = "eu-west-2";
const APPLICATION_VERSION = "1.0.0";

function trackOutboundClicks(awsRum: AwsRumClient): void {
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const anchor = event.target.closest("a");
    if (!anchor) {
      return;
    }

    const payload = outboundClickEvent({
      origin: anchor.origin,
      currentOrigin: window.location.origin,
      href: anchor.href,
      label: anchor.getAttribute("aria-label") ?? anchor.textContent ?? "",
    });

    if (payload) {
      awsRum.recordEvent("outbound_click", payload);
    }
  });
}

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
    const awsRum = new AwsRum(
      PUBLIC_RUM_APP_MONITOR_ID,
      APPLICATION_VERSION,
      RUM_REGION,
      config,
    );
    trackOutboundClicks(awsRum);
  } catch {
    return;
  }
}
