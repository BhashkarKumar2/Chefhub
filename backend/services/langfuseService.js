import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';
import {
  propagateAttributes,
  startActiveObservation
} from '@langfuse/tracing';

const PII_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?91[-\s]?)?[6-9]\d{9}\b/,
  /\b(?:\d[ -]*?){12,19}\b/
];

const MAX_TRACE_TEXT = 1200;

let sdk;
let spanProcessor;
let initialized = false;

const hasCredentials = () => Boolean(
  process.env.LANGFUSE_PUBLIC_KEY &&
  process.env.LANGFUSE_SECRET_KEY
);

export const isLangfuseEnabled = () => initialized && Boolean(spanProcessor);

export const redactForTracing = (value) => {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    let redacted = value;
    PII_PATTERNS.forEach(pattern => {
      redacted = redacted.replace(pattern, '[REDACTED]');
    });
    return redacted.length > MAX_TRACE_TEXT
      ? `${redacted.slice(0, MAX_TRACE_TEXT)}...`
      : redacted;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map(redactForTracing);
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !/token|secret|password|authorization|cookie|image|base64|buffer/i.test(key))
        .map(([key, nestedValue]) => [key, redactForTracing(nestedValue)])
    );
  }

  return value;
};

export const initLangfuse = () => {
  if (initialized || !hasCredentials()) return isLangfuseEnabled();

  process.env.LANGFUSE_TRACING_ENVIRONMENT =
    process.env.LANGFUSE_TRACING_ENVIRONMENT ||
    process.env.NODE_ENV ||
    'development';

  spanProcessor = new LangfuseSpanProcessor({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
  });

  sdk = new NodeSDK({
    spanProcessors: [spanProcessor]
  });

  sdk.start();
  initialized = true;
  console.info('[Langfuse] tracing enabled');
  return true;
};

export const shutdownLangfuse = async () => {
  if (!initialized) return;

  try {
    await spanProcessor?.forceFlush?.();
    await sdk?.shutdown?.();
  } catch (error) {
    console.warn('[Langfuse] shutdown failed:', error.message);
  }
};

export const withLangfuseTrace = async ({
  name,
  userId,
  sessionId,
  input,
  metadata = {},
  tags = []
}, callback) => {
  if (!isLangfuseEnabled()) {
    return callback();
  }

  return propagateAttributes({
    traceName: name,
    userId: userId ? String(userId) : undefined,
    sessionId: sessionId ? String(sessionId) : undefined,
    tags,
    metadata: Object.fromEntries(
      Object.entries(metadata).map(([key, value]) => [key, String(value).slice(0, 200)])
    )
  }, async () => startActiveObservation(name, async (observation) => {
    observation.update({ input: redactForTracing(input) });
    try {
      const output = await callback(observation);
      observation.update({ output: redactForTracing(output?.status || output?.success || 'ok') });
      return output;
    } catch (error) {
      observation.update({
        level: 'ERROR',
        statusMessage: error.message,
        output: { error: error.message }
      });
      throw error;
    }
  }));
};

export const withLangfuseObservation = async ({
  name,
  asType = 'span',
  input,
  metadata = {},
  model
}, callback) => {
  if (!isLangfuseEnabled()) {
    return callback();
  }

  return startActiveObservation(name, async (observation) => {
    observation.update({
      input: redactForTracing(input),
      metadata: redactForTracing(metadata),
      ...(model ? { model } : {})
    });

    try {
      const output = await callback(observation);
      observation.update({ output: redactForTracing(output) });
      return output;
    } catch (error) {
      observation.update({
        level: 'ERROR',
        statusMessage: error.message,
        output: { error: error.message }
      });
      throw error;
    }
  }, { asType });
};
