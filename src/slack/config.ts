interface AppConfig {
  slackBotToken: string;
  slackSigningSecret: string;
  slackAppToken: string;
  defaultChannelId: string;
  port: number;
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function loadConfig(): AppConfig {
  return {
    slackBotToken: requireEnv("SLACK_BOT_TOKEN"),
    slackSigningSecret: requireEnv("SLACK_SIGNING_SECRET"),
    slackAppToken: requireEnv("SLACK_APP_TOKEN"),
    defaultChannelId: requireEnv("SLACK_DEFAULT_CHANNEL_ID"),
    port: Number(process.env.PORT ?? "3000")
  };
}

export type { AppConfig };
