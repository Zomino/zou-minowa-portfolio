# Telemetry and Monitoring Reference

## What telemetry is

Telemetry is the automated collection of data about a running system. It is the foundation of operational awareness: without it, the only way to detect a failure is a user complaint or manual inspection.

**Monitoring** tracks predefined metrics against known thresholds. It detects failure modes you anticipated in advance.

**Observability** is the broader capability to infer a system's internal state from its external outputs. It handles unknown failure modes that were never pre-instrumented. Observability encompasses monitoring; the inverse is not true.

---

## Why it matters: cost of no telemetry

IBM's 2024 Cost of a Data Breach report (604 organisations surveyed) found:

- Average time to identify and contain a security breach: **258 days**
- Average cost of a breach: **$4.88 million**
- Organisations without automated monitoring paid $5.72 million per breach on average, compared to $3.84 million for those with it. Difference: $1.88 million per incident.
- Faster detection correlates directly with lower cost. Breaches contained within 200 days cost $1.26 million less on average than those exceeding 200 days.

ITIC's 2024 Hourly Cost of Downtime report found:

- For over 90% of mid-size and large enterprises, one hour of unplanned downtime costs more than $300,000.
- 41% of enterprises report hourly downtime costs between $1 million and $5 million.

The two key operational metrics are:

- **MTTD (Mean Time to Detect):** Time between an incident starting and it being identified. Telemetry reduces MTTD by surfacing anomalies automatically.
- **MTTR (Mean Time to Resolve):** Time from detection through diagnosis, fix, and verification. MTTD is a direct component of MTTR. Lower MTTD always lowers MTTR.

---

## The three pillars of observability

### Metrics

Numerical measurements sampled or aggregated over time. Examples: request rate, error rate, CPU usage, response time percentiles.

Use metrics for: dashboards, trend analysis, capacity planning, and alerting on thresholds.

**Advantage over logs:** Storage cost does not scale with request volume. A metric like "error rate" is one number regardless of traffic levels.

### Logs

Immutable, timestamped records of discrete events. Structured logs (JSON) are easier to query than plain text. Each entry typically includes timestamp, severity, service name, and message.

Use logs for: debugging specific events, auditing, security forensics, and tracing sequences of events leading to a failure.

**Limitation:** Storage cost scales directly with event volume.

### Traces

Records of individual requests as they propagate across services. A trace consists of spans; each span records one unit of work in one service, including timing and parent/child relationships.

Use traces for: distributed systems and microservices where a request crosses multiple service boundaries. They identify where in a call chain latency or failures originate.

**Combined use:** Metrics tell you when something is wrong. Logs explain what happened. Traces show where in the system it happened.

---

## What to measure

### Infrastructure: the USE method

Applied to every physical or virtual resource (CPU, memory, disk, network). Defined by Brendan Gregg.

| Dimension | Definition | Examples |
|---|---|---|
| Utilisation | Percentage of capacity in use | CPU %, memory used / total |
| Saturation | Work queued waiting for the resource | CPU load average, I/O queue depth |
| Errors | Infrastructure-level failure events | Network packet errors, disk errors |

Non-zero saturation typically indicates a bottleneck. Errors often precede total failure.

### Services: the RED method

Applied to request-handling services and APIs. Defined by Tom Wilkie.

| Dimension | Definition | Examples |
|---|---|---|
| Rate | Requests per second | HTTP requests/s |
| Errors | Failed requests | HTTP 5xx rate, timeouts |
| Duration | Time to process requests | p50, p90, p99 latency |

Measure Duration as a histogram, not a mean. Averages mask tail latency. A p99 of 10 seconds means 1 in 100 users waits 10 seconds, even if the mean looks acceptable.

### Real-user performance: Core Web Vitals

Defined by Google. Thresholds represent the 75th percentile of real user sessions. Google Search ranking uses these metrics.

| Metric | Measures | Good | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | When main content loads | under 2,500 ms | over 4,000 ms |
| INP (Interaction to Next Paint) | Responsiveness of all interactions | under 200 ms | over 500 ms |
| CLS (Cumulative Layout Shift) | Visual stability | under 0.1 | over 0.25 |

INP replaced FID in March 2024. INP measures the 95th percentile of all interactions on a page, not just the first. As of 2026, 43% of websites fail the INP threshold.

---

## SLIs, SLOs, SLAs

**SLI (Service Level Indicator):** The metric you measure. Example: the percentage of requests that succeed.

**SLO (Service Level Objective):** Your internal target. Example: 99.9% of requests succeed. SLOs include a safety buffer above any contractual commitment.

**SLA (Service Level Agreement):** A contractual commitment to customers. Breaching it has defined financial or legal consequences. SLAs are less strict than SLOs.

**Error budget:** The allowable failure margin derived from the SLO.

```
Error budget = (100% - SLO%) x time period
```

Example: a 99.9% monthly SLO allows 43.2 minutes of downtime per month (0.1% of 43,200 minutes).

Typical tiers:

| Tier | Availability | Monthly allowance |
|---|---|---|
| Critical (payments, auth) | 99.9% | 43.8 min |
| Important (dashboards, admin) | 99.5% | 3.6 hours |
| Standard (batch jobs) | 99.0% | 7.2 hours |

---

## Alerting principles

**Alert on:** events that are user-impacting and require immediate human action. The recommended signal is SLO burn rate: alert when the error budget is being consumed faster than the SLO allows, not when a raw metric crosses an arbitrary threshold.

**Record but do not alert on:** low-level infrastructure noise, self-resolving events, non-user-facing degradation, slow trends that do not require immediate action.

**Alert fatigue:** When engineers receive too many false-positive pages, they mute alerts or auto-acknowledge them, making the monitoring system unreliable. Target fewer than 20% of pages that do not require action.

**Multi-window burn rate model:**

| Burn rate | Window | Severity | Response |
|---|---|---|---|
| Fast (2% of budget in 1 hour) | P0 | Page immediately |
| Medium (5% of budget in 6 hours) | P1 | Notify within 30 min |
| Slow (10% of budget in 3 days) | P2 | Review next business day |

Start with 2 to 3 SLIs per service. Too many dilute attention.

---

## Sources

- IBM Security, Cost of a Data Breach Report 2024: newsroom.ibm.com/2024-07-30-ibm-report-escalating-data-breach-disruption-pushes-costs-to-new-highs
- ITIC 2024 Hourly Cost of Downtime Report: itic-corp.com
- Brendan Gregg, USE Method: brendangregg.com/usemethod.html
- Tom Wilkie, RED Method: grafana.com
- Google, Defining Core Web Vitals Thresholds: web.dev/articles/defining-core-web-vitals-thresholds
- Grafana, SLO Best Practices: grafana.com/docs/grafana-cloud/alerting-and-irm/slo/best-practices
