import type { Logger as PinoLogger } from 'pino';
import pino from 'pino'

// Create base Pino logger with environment-specific configuration
const baseLogger = pino({
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
  // Note: Add custom serializers here if needed for production log aggregation
})

class Logger {
  private childLoggerCache = new Map<string, PinoLogger>()

  private createChildLogger(context: string): PinoLogger {
    let cached = this.childLoggerCache.get(context)
    if (!cached) {
      cached = baseLogger.child({ context })
      this.childLoggerCache.set(context, cached)
    }
    return cached
  }

  debug(message: string, context?: string, data?: any): void {
    const logger = context ? this.createChildLogger(context) : baseLogger
    logger.debug(data || {}, message)
  }

  info(message: string, context?: string, data?: any): void {
    const logger = context ? this.createChildLogger(context) : baseLogger
    logger.info(data || {}, message)
  }

  warn(message: string, context?: string, data?: any): void {
    const logger = context ? this.createChildLogger(context) : baseLogger
    logger.warn(data || {}, message)
  }

  error(message: string, context?: string, data?: any): void {
    const logger = context ? this.createChildLogger(context) : baseLogger
    logger.error(data || {}, message)
  }

  // Service-specific methods for better context
  service(serviceName: string) {
    const serviceLogger = this.createChildLogger(`service:${serviceName}`)
    return {
      debug: (message: string, data?: any) =>
        serviceLogger.debug(data || {}, message),
      info: (message: string, data?: any) =>
        serviceLogger.info(data || {}, message),
      warn: (message: string, data?: any) =>
        serviceLogger.warn(data || {}, message),
      error: (message: string, data?: any) =>
        serviceLogger.error(data || {}, message),
    }
  }

  // Hook-specific methods
  hook(hookName: string) {
    const hookLogger = this.createChildLogger(`hook:${hookName}`)
    return {
      debug: (message: string, data?: any) =>
        hookLogger.debug(data || {}, message),
      info: (message: string, data?: any) =>
        hookLogger.info(data || {}, message),
      warn: (message: string, data?: any) =>
        hookLogger.warn(data || {}, message),
      error: (message: string, data?: any) =>
        hookLogger.error(data || {}, message),
    }
  }

  // Component-specific methods
  component(componentName: string) {
    const componentLogger = this.createChildLogger(`component:${componentName}`)
    return {
      debug: (message: string, data?: any) =>
        componentLogger.debug(data || {}, message),
      info: (message: string, data?: any) =>
        componentLogger.info(data || {}, message),
      warn: (message: string, data?: any) =>
        componentLogger.warn(data || {}, message),
      error: (message: string, data?: any) =>
        componentLogger.error(data || {}, message),
    }
  }
}

// Create singleton instance
export const logger = new Logger()

// Export convenience methods for common usage
export const log = {
  debug: (message: string, context?: string, data?: any) =>
    logger.debug(message, context, data),
  info: (message: string, context?: string, data?: any) =>
    logger.info(message, context, data),
  warn: (message: string, context?: string, data?: any) =>
    logger.warn(message, context, data),
  error: (message: string, context?: string, data?: any) =>
    logger.error(message, context, data),
}

// Export the base Pino logger for advanced usage
export { baseLogger }
