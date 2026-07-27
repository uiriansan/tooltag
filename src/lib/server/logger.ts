import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "$env/dynamic/private";

const { combine, timestamp, json, colorize, simple } = winston.format;

const logger_transports: winston.transport[] = [
  // Fallback para console em ENV == "development":
  new winston.transports.Console({
    format: combine(colorize(), simple()),
  }),
];

const file_transport = new DailyRotateFile({
  filename: `${env.DATA_PATH}/logs/%DATE%.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m", // Cria novo arquivo se o aual exceder 20 megabytes
  maxFiles: "7d", // Manter apenas 7 dias de logs, deletando antigos automaticamente
});

file_transport.on("error", (err) => {
  console.error("Erro na rotação dos logs: ", err);
});

if (env.NODE_ENV === "production" && parseInt(env.LOG_TO_FILE! ?? 0) === 1) {
  logger_transports.push(file_transport);
}

export const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  transports: logger_transports,
});
