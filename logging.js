import resourcesPkg from "@opentelemetry/resources";
import semanticPkg from "@opentelemetry/semantic-conventions";
import { trace, context } from "@opentelemetry/api";
import sdkLogsPkg from "@opentelemetry/sdk-logs";
import exporterLogsPkg from "@opentelemetry/exporter-logs-otlp-http";

const { Resource } = resourcesPkg;
const { SemanticResourceAttributes } = semanticPkg;
const { LoggerProvider, BatchLogRecordProcessor } = sdkLogsPkg;
const { OTLPLogExporter } = exporterLogsPkg;

// Create a logger provider with service metadata
const loggerProvider = new LoggerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "svelte-demo-service",
  }),
});

// Configure OTLP log exporter to send logs to local collector
const exporter = new OTLPLogExporter({
  url: "http://localhost:4318/v1/logs",
});

loggerProvider.addLogRecordProcessor(
  new BatchLogRecordProcessor(exporter)
);

// Create a logger
const logger = loggerProvider.getLogger("default-logger");

/**
 * Emit a log tied to the current active span.
 * If no active span exists, optionally create a temporary one
 * (useful for 404/500 cases).
 */
export function emitLog(message, attributes = {}, { forceSpan = false } = {}) {
  const activeSpan = trace.getSpan(context.active());

  if (activeSpan) {
    // Already inside a span → log will auto-carry trace_id/span_id
    logger.emit({
      severityText: "INFO",
      body: message,
      attributes,
    });
  } else if (forceSpan) {
    // No span active → create a short-lived one for context
    const tracer = trace.getTracer("default-tracer");
    tracer.startActiveSpan(message, (span) => {
      logger.emit({
        severityText: "INFO",
        body: message,
        attributes,
      });
      span.end();
    });
  } else {
    // Just log without trace context
    logger.emit({
      severityText: "INFO",
      body: message,
      attributes,
    });
  }
}
