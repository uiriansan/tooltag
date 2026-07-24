import cron from "node-cron";
import { backup_database } from "$lib/server/db/client";

// Backup automático do banco de dados:
// Executa diariamente, à meia-noite.
cron.schedule("0 0 * * *", async () => {
  await backup_database();
});

// TODO: Add PM2.
// TODO: Add Winston and Windon-daily-rotate-file
// TODO: Deploy Docker container.
