type LogMetadata = Record<string, unknown> | undefined;

const formatLog = (
  level: "info" | "warn" | "error",
  message: string,
  metadata?: LogMetadata
) => {
  const payload = metadata ? { ...metadata } : undefined;
  const prefix = `[HouseHarmony][${level.toUpperCase()}]`;

  switch (level) {
    case "info":
      payload ? console.info(prefix, message, payload) : console.info(prefix, message);
      break;
    case "warn":
      payload ? console.warn(prefix, message, payload) : console.warn(prefix, message);
      break;
    case "error":
      payload ? console.error(prefix, message, payload) : console.error(prefix, message);
      break;
  }
};

export const logger = {
  info: (message: string, metadata?: LogMetadata) => formatLog("info", message, metadata),
  warn: (message: string, metadata?: LogMetadata) => formatLog("warn", message, metadata),
  error: (message: string, metadata?: LogMetadata) => formatLog("error", message, metadata),
};
