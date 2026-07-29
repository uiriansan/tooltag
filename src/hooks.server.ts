import cron from "node-cron";
import { backup_database } from "$lib/server/db";
import { NODE_ENV } from "$env/static/private";
import { logger } from "$lib/server/logger";
import type { Handle, HandleServerError } from "@sveltejs/kit";

// Backup automático do banco de dados:
// Executa diariamente, à meia-noite.
if (NODE_ENV === "production") {
  cron.schedule("0 0 * * *", async () => {
    await backup_database();
  });
}

export const handle: Handle = async ({ event, resolve }) => {
  const start = Date.now();
  const response = await resolve(event);
  const duration = Date.now() - start;

  logger.info(`HTTP ${event.request.method} ${event.url.pathname}`, {
    status: response.status,
    duration: `${duration}ms`,
    ip: event.getClientAddress(),
  });

  return response;
};

export const handleError: HandleServerError = async ({
  error,
  event,
  status,
  message,
}) => {
  logger.error(`${event.request.method} ${event.url.pathname}`, {
    status: status,
    message,
    error: status === 500 ? error : "",
  });

  return {
    status,
    message,
  };
};

// TODO: Add systemd service.
// TODO: Deploy Docker container.
