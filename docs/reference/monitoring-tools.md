# Monitoring Tools: CloudWatch vs Grafana Cloud

## Summary

Use CloudWatch if infrastructure is fully AWS-native. Use Grafana Cloud if multi-cloud is planned, dashboards matter, or you want to monitor multiple personal projects in one place.

---

## CloudWatch

**Best for**

- Infrastructure entirely within AWS
- Small teams wanting minimal operational overhead
- Immediate visibility into AWS services (Lambda, ECS, ALB) without extra setup

**Strengths**

- Native integration with AWS services. No agent required.
- Permissions managed entirely via IAM.
- Low cost at small scale with pay-per-use pricing.

**Weaknesses**

- Proprietary query language (Logs Insights) has a learning curve.
- Dashboard quality is noticeably worse than Grafana.
- Tracing uses X-Ray as a separate service, making log correlation cumbersome.
- Log storage costs can exceed expectations as volume grows.

---

## Grafana Cloud

Recommended stack: Grafana Cloud SaaS + CloudWatch data source, or Prometheus (metrics) + Loki (logs) + Tempo (traces).

**Best for**

- Plans to add non-AWS services in future
- Teams already familiar with Grafana
- Correlating logs, metrics, and traces in a single view
- Monitoring multiple personal projects under one account

**Strengths**

- No vendor lock-in. Continues working across cloud migrations.
- High-quality dashboards, easy to share across teams.
- SaaS version requires no server management.
- Can connect to CloudWatch as a data source, reusing existing AWS data.
- Multiple projects can share one account. Tag metrics and logs with a `project` label and filter in dashboards.

**Weaknesses**

- AWS integration requires manual setup (data source config or agent).
- Free tier limits are shared across all projects in the account.
- Self-hosting requires EC2 or equivalent. Minimum ~$15/month. Grafana is a stateful long-running process and cannot run on Lambda or other serverless compute.

**Grafana Cloud free tier (permanent, no credit card required)**

| Item | Limit |
|---|---|
| Metrics | 10,000 series |
| Logs | 50 GB/month |
| Traces | 50 GB/month |
| Retention | 14 days |

For a portfolio site or small personal projects, this free tier is sufficient indefinitely.

---

## Decision guide

| Condition | Choice |
|---|---|
| AWS only, want simplest setup | CloudWatch + X-Ray |
| Multi-cloud planned | Grafana Cloud (free tier) |
| Dashboard quality matters | Grafana Cloud (free tier) |
| Cost is the priority | Grafana Cloud free tier is cheapest. Self-hosting costs more. |

## Application to this project

Current setup is CloudFront + S3 (static site). CloudWatch is sufficient for now. Revisit Grafana Cloud if a backend API or server-side processing is added.
