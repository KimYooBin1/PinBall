import type { Logger, SlackCommandMiddlewareArgs } from "@slack/bolt";
import type { WebClient } from "@slack/web-api";
import { drawWinners } from "../domain/picker.js";
import {
  buildDailyRecruitmentMessage,
  buildPinballHelpMessage,
  buildPinballRecruitmentMessage,
  buildWinnerAnnouncement
} from "./messages.js";
import { getUniqueEligibleUsers } from "./reactions.js";

interface DailyState {
  latestDailyMessageTs?: string;
}

function parseWinnerCount(text: string): number | null {
  const trimmed = text.trim();

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const count = Number(trimmed);
  return count > 0 ? count : null;
}

async function announceNoParticipants(
  client: WebClient,
  channel: string,
  context: string
): Promise<void> {
  await client.chat.postMessage({
    channel,
    text: buildWinnerAnnouncement([], context)
  });
}

async function announceWinners(
  client: WebClient,
  channel: string,
  context: string,
  winners: string[]
): Promise<void> {
  await client.chat.postMessage({
    channel,
    text: buildWinnerAnnouncement(winners, context)
  });
}

export async function postDailyRecruitment(
  client: WebClient,
  channel: string,
  state: DailyState
): Promise<void> {
  const response = await client.chat.postMessage({
    channel,
    text: buildDailyRecruitmentMessage()
  });

  state.latestDailyMessageTs = response.ts;
}

export async function drawDailyWinner(
  client: WebClient,
  channel: string,
  state: DailyState,
  logger: Logger
): Promise<void> {
  if (!state.latestDailyMessageTs) {
    logger.warn("Skipping daily draw because no daily message timestamp is available.");
    return;
  }

  const candidates = await getUniqueEligibleUsers(
    client,
    channel,
    state.latestDailyMessageTs
  );

  if (candidates.length === 0) {
    await announceNoParticipants(client, channel, "Dinner decider draw:");
    return;
  }

  const winners = drawWinners(candidates, 1);
  await announceWinners(client, channel, "Dinner decider draw:", winners);
}

export async function handlePinballCommand(
  args: SlackCommandMiddlewareArgs & { client: WebClient },
  logger: Logger
): Promise<void> {
  const trimmedText = args.command.text.trim().toLowerCase();
  const winnerCount = parseWinnerCount(args.command.text);

  await args.ack();

  if (trimmedText === "help") {
    await args.respond({
      response_type: "ephemeral",
      text: buildPinballHelpMessage()
    });
    return;
  }

  if (!winnerCount) {
    await args.respond({
      response_type: "ephemeral",
      text: "Usage: /pinball <positive-number> or /pinball help"
    });
    return;
  }

  const post = await args.client.chat.postMessage({
    channel: args.command.channel_id,
    text: buildPinballRecruitmentMessage(winnerCount)
  });

  setTimeout(async () => {
    try {
      if (!post.ts) {
        logger.error("Cannot draw /pinball winners without a message timestamp.");
        return;
      }

      const candidates = await getUniqueEligibleUsers(
        args.client,
        args.command.channel_id,
        post.ts
      );

      if (candidates.length === 0) {
        await announceNoParticipants(
          args.client,
          args.command.channel_id,
          "PinBall draw:"
        );
        return;
      }

      const adjustedWinnerCount = Math.min(winnerCount, candidates.length);
      const winners = drawWinners(candidates, adjustedWinnerCount);

      await announceWinners(
        args.client,
        args.command.channel_id,
        "PinBall draw:",
        winners
      );
    } catch (error) {
      logger.error(error);
    }
  }, 3 * 60 * 1000);
}

export function createDailyState(): DailyState {
  return {};
}
