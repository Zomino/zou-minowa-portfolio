const NAMESPACE = "ZouChat";

interface RequestMetric {
  status: number;
  reason: string | undefined;
  latencyMs: number;
  timestamp: number;
}

export const buildEmf = (metric: RequestMetric) => {
  const outcome =
    metric.reason === undefined
      ? `${metric.status}`
      : `${metric.status}:${metric.reason}`;

  return {
    _aws: {
      Timestamp: metric.timestamp,
      CloudWatchMetrics: [
        {
          Namespace: NAMESPACE,
          Dimensions: [["Outcome"]],
          Metrics: [
            { Name: "Requests", Unit: "Count" },
            { Name: "Latency", Unit: "Milliseconds" },
          ],
        },
      ],
    },
    Outcome: outcome,
    Requests: 1,
    Latency: metric.latencyMs,
  };
};

export const emitMetrics = (metric: RequestMetric) => {
  console.log(JSON.stringify(buildEmf(metric)));
};
