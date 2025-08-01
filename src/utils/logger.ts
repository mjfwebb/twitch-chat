import pc from "picocolors";

export const logLevels = ["error", "warn", "info", "debug"];

export type LogLevel = (typeof logLevels)[number];

const logLevelsMap: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

const formattedDate = () => {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const millis = String(date.getMilliseconds()).padStart(3, "0");
  return `[${hours}:${minutes}:${seconds}.${millis}] `;
};

let logLevel: number = logLevelsMap["debug"]; // Set default log level to debug so we can see the logger message from config loading

export function setLogLevel(logLevelString: string) {
  logLevel = logLevelsMap[logLevelString];
}

export const logger = {
  error: (...args: unknown[]) => {
    console.error(`${formattedDate()} ${pc.red("Error:")}`, ...args);
  },
  warn: (...args: unknown[]) => {
    if (logLevel >= logLevelsMap["warn"]) {
      console.warn(`${formattedDate()} ${pc.yellow("Warn:")}`, ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (logLevel >= logLevelsMap["info"]) {
      console.info(`${formattedDate()} ${pc.cyan("Info:")}`, ...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (logLevel >= logLevelsMap["debug"]) {
      console.debug(`${formattedDate()} ${pc.magenta("Debug:")}`, ...args);
    }
  },
};
