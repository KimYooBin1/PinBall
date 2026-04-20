import "dotenv/config";
import { App, LogLevel } from "@slack/bolt";
import cron from "node-cron";
import { loadConfig } from "./slack/config.js";
import {
  createDailyState,
  drawDailyWinner,
  handleHelpCommand,
  handlePinballCommand,
  handleWeightedPinballCommand,
  postDailyRecruitment
} from "./slack/workflows.js";

const config = loadConfig();

const app = new App({
  token: config.slackBotToken,
  signingSecret: config.slackSigningSecret,
  socketMode: true,
  appToken: config.slackAppToken,
  logLevel: LogLevel.INFO
});

const dailyState = createDailyState();

app.command("/pinball", async (args) => {
  await handlePinballCommand(args, app.logger);
});

app.command("/pinball-weighted", async (args) => {
  await handleWeightedPinballCommand(args, app.logger);
});

app.command("/help", async (args) => {
  await handleHelpCommand(args, app.logger);
});

cron.schedule(
  "0 17 * * *",
  async () => {
    try {
      await postDailyRecruitment(app.client, config.defaultChannelId, dailyState);
    } catch (error) {
      app.logger.error(error);
    }
  },
  { timezone: "Asia/Seoul" }
);

cron.schedule(
  "10 17 * * *",
  async () => {
    try {
      await drawDailyWinner(app.client, config.defaultChannelId, dailyState, app.logger);
    } catch (error) {
      app.logger.error(error);
    }
  },
  { timezone: "Asia/Seoul" }
);

async function main(): Promise<void> {
  await app.start(config.port);
  app.logger.info(`PinBall app is running on port ${config.port}.`);
}

main().catch((error) => {
  app.logger.error(error);
  process.exit(1);
});
