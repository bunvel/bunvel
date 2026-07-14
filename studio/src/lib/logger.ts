import pino from 'pino'

// Create base logger with environment-specific configuration
export const logger = pino({
  level: import.meta.env.DEV ? 'debug' : 'warn',
  formatters: {
    level: (label) => ({ level: label }),
    log: (object) => {
      // Add timestamp if not present
      if (!object.time) {
        object.time = new Date().toISOString()
      }
      return object
    },
  },
  // In development, use pretty printing
  transport: import.meta.env.DEV
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
})


// Utility for creating context-specific loggers
export const createLogger = (context: string) =>
  logger.child({ service: 'bunvel-studio', component: context })

// Frontend wide events (user actions, errors, performance)
export const logWideEvent = (event: string, data: Record<string, any>) => {
  const wideEvent = {
    event,
    timestamp: new Date().toISOString(),
    service: 'bunvel-studio',
    version: import.meta.env.PACKAGE_VERSION || '0.0.0',
    environment: import.meta.env.MODE,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    ...data,
  }

  // Use appropriate log level based on event type
  if (event.includes('error') || event.includes('failure')) {
    logger.error(wideEvent)
  } else if (event.includes('warn') || event.includes('warning')) {
    logger.warn(wideEvent)
  } else {
    logger.info(wideEvent)
  }
}
