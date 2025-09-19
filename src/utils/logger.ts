import * as Sentry from '@sentry/react';
import pc from 'picocolors';

export const logLevels = ['error', 'warn', 'info', 'debug'];

export type LogLevel = (typeof logLevels)[number];

const logLevelsMap: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

const formattedDate = () => {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const millis = String(date.getMilliseconds()).padStart(3, '0');
  return `[${hours}:${minutes}:${seconds}.${millis}] `;
};

let logLevel: number = logLevelsMap['debug']; // Set default log level to debug so we can see the logger message from config loading

export function setLogLevel(logLevelString: string) {
  logLevel = logLevelsMap[logLevelString];
}

const APP_VERSION = import.meta.env.APP_VERSION || 'unknown';

export const logger = {
  error: (message: string, extra?: Record<string, unknown>) => {
    Sentry.logger.error(`${formattedDate()} (v${APP_VERSION}) ${pc.red('Error:')} ${message}`, extra);
  },
  warn: (message: string, extra?: Record<string, unknown>) => {
    if (logLevel >= logLevelsMap['warn']) {
      Sentry.logger.warn(`${formattedDate()} (v${APP_VERSION}) ${pc.yellow('Warn:')} ${message}`, extra);
    }
  },
  info: (message: string, extra?: Record<string, unknown>) => {
    if (logLevel >= logLevelsMap['info']) {
      Sentry.logger.info(`${formattedDate()} (v${APP_VERSION}) ${pc.cyan('Info:')} ${message}`, extra);
    }
  },
  debug: (...args: unknown[]) => {
    if (logLevel >= logLevelsMap['debug']) {
      console.debug(`${formattedDate()} (v${APP_VERSION}) ${pc.magenta('Debug:')}`, ...args);
    }
  },
};
