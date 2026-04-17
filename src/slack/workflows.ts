import type { Logger, SlackCommandMiddlewareArgs } from "@slack/bolt";
import type { WebClient } from "@slack/web-api";
import { drawWinners } from "../domain/picker.js";
import {
  buildDailyRecruitmentMessage,
  buildInsufficientParticipantsMessage,
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
    await announceNoParticipants(client, channel, "오늘의 저녁 결정자");
    return;
  }

  const winners = drawWinners(candidates, 1);
  await announceWinners(client, channel, "오늘의 저녁 결정자", winners);
}

export async function handlePinballCommand(
  args: SlackCommandMiddlewareArgs & { client: WebClient },
  logger: Logger
): Promise<void> {
  const winnerCount = parseWinnerCount(args.command.text);

  await args.ack();

  if (!winnerCount) {
    await args.respond({
      response_type: "ephemeral",
      text: "사용법: `/pinball <양의 숫자>`를 입력해주세요. 도움이 필요하면 `/help`를 불러주세요. 핀볼은 숫자를 좋아합니다."
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
          "핀볼 추첨"
        );
        return;
      }

      if (candidates.length < winnerCount) {
        await args.client.chat.postMessage({
          channel: args.command.channel_id,
          text: buildInsufficientParticipantsMessage(winnerCount, candidates.length)
        });
        return;
      }

      const winners = drawWinners(candidates, winnerCount);

      await announceWinners(
        args.client,
        args.command.channel_id,
        "핀볼 추첨",
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

export async function handleHelpCommand(
  args: SlackCommandMiddlewareArgs,
  _logger: Logger
): Promise<void> {
  await args.ack();
  await args.respond({
    response_type: "ephemeral",
    text: buildPinballHelpMessage()
  });
}
