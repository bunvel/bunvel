import pino from "pino";
import { env } from "../config/env";
import { LOGGING_CONFIG } from "../config/constants";

// Create base Pino logger with environment-specific configuration
export const logger = pino({
  level: LOGGING_CONFIG.level,
  base: LOGGING_CONFIG.base,
  timestamp: pino.stdTimeFunctions[LOGGING_CONFIG.timestamp],
  formatters: {
    level: (label) => ({ level: label }),
    log: (object) => {
      if (!object.time) {
        object.time = new Date().toISOString();
      }
      return object;
    },
  },
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

export const queryLogger = logger.child({
  service: "bunvel-queries",
  component: "database",
});

export const errorLogger = logger.child({
  service: "bunvel-errors",
  component: "error-handling",
});

export const httpLogger = logger.child({
  service: "bunvel-http",
  component: "request-handling",
});
