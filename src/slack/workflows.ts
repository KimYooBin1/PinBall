import type { Logger, SlackCommandMiddlewareArgs } from "@slack/bolt";
import type { WebClient } from "@slack/web-api";
import { drawWeightedWinners, drawWinners } from "../domain/picker.js";
import {
  buildDailyRecruitmentMessage,
  buildInsufficientParticipantsMessage,
  buildPinballHelpMessage,
  buildPinballRecruitmentMessage,
  buildPinballWinnerAnnouncement,
  buildWeightedPinballRecruitmentMessage,
  buildWinnerAnnouncement
} from "./messages.js";
import { getUniqueEligibleUsers, getWeightedEligibleUsers } from "./reactions.js";

export const COMMAND_DRAW_DELAY_MS = 60 * 1000;

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
  winners: string[],
  buildAnnouncement = buildWinnerAnnouncement
): Promise<void> {
  await client.chat.postMessage({
    channel,
    text: buildAnnouncement(winners, context)
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
        winners,
        buildPinballWinnerAnnouncement
      );
    } catch (error) {
      logger.error(error);
    }
  }, COMMAND_DRAW_DELAY_MS);
}

export async function handleWeightedPinballCommand(
  args: SlackCommandMiddlewareArgs & { client: WebClient },
  logger: Logger
): Promise<void> {
  const winnerCount = parseWinnerCount(args.command.text);

  await args.ack();

  if (!winnerCount) {
    await args.respond({
      response_type: "ephemeral",
      text: "사용법: `/pinball-weighted <양의 숫자>`를 입력해주세요. 이모지 1개가 티켓 1장입니다."
    });
    return;
  }

  const post = await args.client.chat.postMessage({
    channel: args.command.channel_id,
    text: buildWeightedPinballRecruitmentMessage(winnerCount)
  });

  setTimeout(async () => {
    try {
      if (!post.ts) {
        logger.error("Cannot draw /pinball-weighted winners without a message timestamp.");
        return;
      }

      const tickets = await getWeightedEligibleUsers(
        args.client,
        args.command.channel_id,
        post.ts
      );
      const uniqueCandidates = [...new Set(tickets)];

      if (uniqueCandidates.length === 0) {
        await announceNoParticipants(
          args.client,
          args.command.channel_id,
          "가중 핀볼 추첨"
        );
        return;
      }

      if (uniqueCandidates.length < winnerCount) {
        await args.client.chat.postMessage({
          channel: args.command.channel_id,
          text: buildInsufficientParticipantsMessage(winnerCount, uniqueCandidates.length)
        });
        return;
      }

      const winners = drawWeightedWinners(tickets, winnerCount);

      await announceWinners(
        args.client,
        args.command.channel_id,
        "가중 핀볼 추첨",
        winners,
        buildPinballWinnerAnnouncement
      );
    } catch (error) {
      logger.error(error);
    }
  }, COMMAND_DRAW_DELAY_MS);
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
