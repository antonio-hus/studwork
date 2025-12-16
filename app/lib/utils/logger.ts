/** @format */
import pino, { Logger as PinoLogger } from 'pino'

/**
 * Log Level Configuration
 * Can be controlled via environment variables
 */
const logLevel = process.env.LOG_LEVEL || 'info'

/**
 * Base Pino instance
 * Configured for structured JSON logging in production
 * and pretty printing in development (if pino-pretty is installed)
 */
const baseLogger = pino({
    level: logLevel,
    transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'HH:MM:ss',
        },
    } : undefined,
    base: {
        env: process.env.NODE_ENV,
    },
})

/**
 * Application Logger
 * Provides structured logging with service context
 */
export class Logger {
    private logger: PinoLogger

    constructor(serviceName: string) {
        this.logger = baseLogger.child({ service: serviceName })
    }

    /**
     * Log info level message
     * @param message - Main log message
     * @param meta - Optional metadata object
     */
    info(message: string, meta?: Record<string, any>) {
        this.logger.info(meta || {}, message)
    }

    /**
     * Log warning level message
     * @param message - Warning message
     * @param meta - Optional metadata object
     */
    warn(message: string, meta?: Record<string, any>) {
        this.logger.warn(meta || {}, message)
    }

    /**
     * Log error level message
     * @param message - Error description
     * @param error - Error object or metadata
     */
    error(message: string, error?: Error | Record<string, any>) {
        if (error instanceof Error) {
            this.logger.error({ err: error }, message)
        } else {
            this.logger.error(error || {}, message)
        }
    }

    /**
     * Log debug level message
     * @param message - Debug message
     * @param meta - Optional metadata
     */
    debug(message: string, meta?: Record<string, any>) {
        this.logger.debug(meta || {}, message)
    }
}

/**
 * Factory helper to create a named logger instance
 * @param name - Service or Component name
 */
export const createLogger = (name: string) => new Logger(name)
