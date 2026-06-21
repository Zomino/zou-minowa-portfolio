# CloudWatch RUM App Monitors and Cognito

How Amazon CloudWatch RUM (Real User Monitoring) collects client-side telemetry from real browsers, and how it authorises anonymous visitors to send that data without leaking AWS credentials.

## What it is

CloudWatch RUM measures a web application from inside the visitor's browser. A small JavaScript client embedded in each page records page loads, Core Web Vitals, JavaScript errors, and HTTP request failures, batches them, and sends them to AWS. This is the same category of tool as Vercel Speed Insights and Vercel Web Analytics: it reports what real users actually experienced, rather than what the server or CDN observed.

The central resource is the **app monitor**. It represents one application, holds the configuration (which domain may send data, what to collect, the sample rate, the linked Cognito identity pool), stores the collected events, and renders the dashboards.

## Why it matters

A CDN sees requests and status codes, but it cannot see render timing, layout shift, or a script that throws on a visitor's device. Those failures are invisible server-side yet directly degrade the experience. Without real user monitoring, a slow Largest Contentful Paint or a JavaScript error affecting one browser family can persist unnoticed because every server-side metric looks healthy. RUM closes that blind spot by reporting from the only place the truth is visible: the browser.

## Core concepts

### The web client

The client is delivered one of two ways. The console generates an **embedded snippet**, a small self-executing function that asynchronously downloads the full client from a CDN. Alternatively the client is installed as an **npm module** and bundled into the application. The asynchronous load matters because monitoring must never block or slow the page it measures. If the client loaded synchronously, the monitoring tool itself would harm the metric it exists to record.

Each recorded item (a page view, a JavaScript error, an HTTP error) is a **RUM event**. The client batches events from a session and sends each batch with a single `PutRumEvents` API call. Batching exists to limit network overhead and event volume, which matters because RUM is billed by event count. See the [CloudWatch pricing page](https://aws.amazon.com/cloudwatch/pricing/) for current rates.

### The credential problem

`PutRumEvents` is an AWS API call, and AWS rejects anonymous API calls. Every request must be signed with credentials. But the caller here is arbitrary public JavaScript running in any visitor's browser, so you cannot ship real AWS keys in the page. Anyone could extract them and call any permitted API. This is the problem Cognito solves.

### Cognito identity pools and the enhanced flow

A Cognito **identity pool** configured for **unauthenticated (guest) access** vends temporary, tightly scoped credentials to callers who have no login. The client uses what AWS calls the *enhanced flow*:

1. **GetId** is called with the identity pool ID. No authentication token is required for guest access. Cognito returns an identity ID.
2. **GetCredentialsForIdentity** is called with that identity ID. Cognito internally calls AWS STS `AssumeRoleWithWebIdentity` against the identity pool's unauthenticated IAM role and returns short-lived credentials.

The browser never holds a long-lived secret. It holds credentials that expire and that can do exactly one thing. If those credentials are scraped from the page, the worst an attacker can do is send RUM events to your app monitor, which is harmless. Getting this wrong, for example by attaching an over-broad policy to the role, would turn a public page into a way to call other AWS APIs, so the scope of the role is the security boundary that matters most here.

### IAM authorisation

The identity pool's unauthenticated role carries an IAM policy granting `rum:PutRumEvents` on the specific app monitor ARN, and nothing else:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["rum:PutRumEvents"],
      "Resource": "arn:aws:rum:eu-west-2:ACCOUNT:appmonitor/zou-minowa-portfolio"
    }
  ]
}
```

The resource is pinned to one app monitor on purpose. A wildcard resource would let any holder of the guest credentials write data to every app monitor in the account. One consequence is easy to trip over: if you point a second app monitor at an existing identity pool and role, that role will not automatically be allowed to call `PutRumEvents` on the new monitor. The policy resource must be updated to include it, or the new monitor silently receives nothing.

The role's trust policy must allow `cognito-identity.amazonaws.com` to assume it, otherwise the STS step in the enhanced flow fails and the browser gets no credentials.

## The full request path

```
browser runs snippet
  -> downloads RUM web client from CDN (async)
  -> Cognito GetId            (identity pool, guest)
  -> Cognito GetCredentialsForIdentity -> STS AssumeRoleWithWebIdentity -> temp creds
  -> rum:PutRumEvents (signed, scoped to one app monitor)
  -> app monitor stores events -> CloudWatch RUM dashboards
```

## Principles

- **Sampling controls cost and signal.** The app monitor's session sample rate decides what fraction of sessions report. A lower rate cuts event volume and cost but reduces statistical confidence on low-traffic sites. For low traffic, a high rate gives complete data at negligible cost; for high traffic, sampling keeps spend bounded.
- **Scope the IAM role to one app monitor.** It is the boundary that keeps public guest credentials harmless.
- **Keep event storage in RUM unless you need querying.** RUM can also forward events to CloudWatch Logs for custom queries, but that adds log ingestion cost, so enable it only when the RUM console views are insufficient.
- **The domain setting gates ingestion.** The app monitor only accepts data from its configured domain, which prevents other sites from polluting your metrics. It must be updated when the application moves to a new domain, or data stops arriving after the move.

## Sources

- [CloudWatch RUM overview](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-RUM.html)
- [Authorise your web application to send data to AWS](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-RUM-get-started-authorization.html)
- [Information collected by the CloudWatch RUM web client](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-RUM-datacollected.html)
- [PutRumEvents API reference](https://docs.aws.amazon.com/cloudwatchrum/latest/APIReference/API_PutRumEvents.html)
- [Cognito identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html)
- [GetCredentialsForIdentity API reference](https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetCredentialsForIdentity.html)
- [Understanding Amazon Cognito Authentication: Enhanced Flow](https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-authentication-part-4-enhanced-flow/)
- [aws-rum-web client configuration](https://github.com/aws-observability/aws-rum-web/blob/main/docs/configuration.md)
