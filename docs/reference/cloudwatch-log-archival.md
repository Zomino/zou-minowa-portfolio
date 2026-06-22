# Long-Term CloudWatch Log Archival

## What it is

CloudWatch Logs is built for hot, recent log access. It is not built to hold logs cheaply for years. The ideal architecture for keeping logs forever, while staying able to query them retrospectively, streams every log group into Amazon S3 in near real time and queries the archive with Amazon Athena.

The shape is:

```
log source → CloudWatch log group → subscription filter
  → Amazon Data Firehose → S3 (partitioned, compressed)
  → Athena / Glue for retrospective queries
```

CloudWatch keeps a short window for fast incident search. S3 keeps the permanent copy at archival cost. Firehose is the managed pipe between them.

## Why it matters

CloudWatch Logs charges for ingestion and for ongoing storage of retained data. Holding everything in CloudWatch indefinitely means paying that storage rate forever, on data you rarely read. S3 storage is far cheaper per GB, and S3 Glacier tiers drop the cost further for data you almost never touch. Independent write-ups put a Subscription to Firehose to S3 Deep Archive pipeline at roughly 85 percent cheaper than long CloudWatch retention over an 18 month horizon. Storage class pricing changes, so confirm against the [S3 pricing page](https://aws.amazon.com/s3/pricing/) and [CloudWatch pricing page](https://aws.amazon.com/cloudwatch/pricing/).

Getting this wrong has two failure modes. Keep everything in CloudWatch and the bill grows without bound. Delete logs on a short retention to save money and you lose the ability to investigate anything older than the window, which defeats the point of keeping logs at all.

## Core concepts

**Subscription filter.** Attaches to a log group and streams matching events to a destination as they arrive. An empty filter pattern ships everything. This is the mechanism that gets logs out of CloudWatch continuously. The alternative, the `CreateExportTask` batch API, has a concurrency limit of one task at a time, so tasks queue and fail under load. That makes it unreliable for audit-grade retention. Prefer subscription filters for any ongoing archive.

**Amazon Data Firehose.** A managed delivery stream that buffers incoming records, then writes them to S3 in batches. It removes the need to build and run a custom consumer. Records arrive gzip compressed from CloudWatch. Firehose can also convert records to Apache Parquet before writing, which matters for query cost, covered below.

**S3 partitioning.** Writing objects under a time based prefix such as `year=/month=/day=` lets Athena read only the folders covering the requested period. Without partitioning, every query scans the entire archive, so cost and latency grow with total log volume rather than with the slice you asked for.

**Athena and Glue.** Athena queries S3 directly with SQL and charges per data scanned. A Glue table or crawler describes the schema and partitions so Athena knows how to read the files. Partition pruning plus columnar Parquet is what keeps a query over years of logs scanning kilobytes rather than terabytes.

**Retention split.** Set a short retention on the CloudWatch log group for fast recent access, and let S3 hold the permanent copy. The two are independent: trimming CloudWatch retention does not touch what already landed in S3.

## Key settings and thresholds

| Setting | Why it matters |
| --- | --- |
| Subscription filter pattern | Empty pattern archives all events. A pattern drops non matching lines before they reach S3, shrinking the archive but losing whatever you filtered out. |
| Firehose buffer size and interval | Firehose flushes when either the size or the time threshold is hit. Larger buffers mean fewer, bigger S3 objects, which Athena reads more efficiently. Smaller buffers cut delivery latency. |
| Compression | GZIP or Parquet shrinks stored bytes and the bytes Athena scans. Skipping it inflates both storage and query cost. |
| Record format conversion to Parquet | Columnar format lets Athena read only the columns a query needs. Leaving logs as raw JSON forces full row scans, raising cost on every query. |
| S3 lifecycle to Glacier | Transitioning old objects to a colder tier cuts storage cost for data you rarely read. Set no expiration to keep logs forever. |
| CloudWatch `retention_in_days` | Configurable from one day up to ten years, or never expire. Short values cut CloudWatch cost once S3 holds the archive. Leaving it never expire keeps paying CloudWatch storage on data already copied to S3. |

## Principles

- **Stream, do not batch export.** Subscription filters deliver continuously and reliably. The export task API does not scale for ongoing retention.
- **Two tiers, two jobs.** CloudWatch for recent and fast, S3 for old and cheap. Do not ask one store to do both.
- **Partition and compress before you ever query.** These are decided at write time. Retrofitting them onto an unpartitioned raw archive means rewriting all of it.
- **Own retention deliberately.** Declare log groups and their `retention_in_days` so the setting lives in version control and does not drift. For groups created automatically by a service, such as a RUM log group, either set retention out of band or import only that one attribute, rather than letting it default to never expire by accident.
- **Filter at the edge only when sure.** A subscription filter pattern saves storage but permanently discards what it drops. When in doubt, archive everything and filter at query time.

## Sources

- [Log group-level subscription filters, Amazon CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/SubscriptionFilters.html)
- [Send CloudWatch Logs to Firehose, Amazon Data Firehose](https://docs.aws.amazon.com/firehose/latest/dev/writing-with-cloudwatch-logs.html)
- [Deliver decompressed CloudWatch Logs to S3 and Splunk using Firehose, AWS Big Data Blog](https://aws.amazon.com/blogs/big-data/deliver-decompressed-amazon-cloudwatch-logs-to-amazon-s3-and-splunk-using-amazon-data-firehose/)
- [Stop Paying Too Much for CloudWatch Logs, Auto-Archive to S3 via Firehose, AWS Builder Center](https://builder.aws.com/content/3CfNe6u1tkt2ITpdw7PvwXaXhMw/stop-paying-too-much-for-cloudwatch-logs-auto-archive-to-s3-via-firehose)
- [Using Athena to query multi-account CloudWatch Logs, DEV Community](https://dev.to/markymarkus/using-athena-to-query-multi-account-cloudwatch-logs-54j)
