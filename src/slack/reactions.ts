import type { WebClient } from "@slack/web-api";
import { normalizeCandidates, type Candidate } from "../domain/picker.js";

async function fetchMessageReactions(
  client: WebClient,
  channel: string,
  timestamp: string
): Promise<string[]> {
  const response = await client.reactions.get({
    channel,
    timestamp,
    full: true
  });

  const reactions = response.message?.reactions ?? [];
  const userIds = new Set<string>();

  for (const reaction of reactions) {
    for (const userId of reaction.users ?? []) {
      userIds.add(userId);
    }
  }

  return [...userIds];
}

async function fetchMessageReactionTickets(
  client: WebClient,
  channel: string,
  timestamp: string
): Promise<string[]> {
  const response = await client.reactions.get({
    channel,
    timestamp,
    full: true
  });

  const reactions = response.message?.reactions ?? [];
  const tickets: string[] = [];

  for (const reaction of reactions) {
    tickets.push(...(reaction.users ?? []));
  }

  return tickets;
}

async function hydrateCandidates(
  client: WebClient,
  userIds: string[]
): Promise<Candidate[]> {
  const profiles = await Promise.all(
    userIds.map(async (userId) => {
      const response = await client.users.info({ user: userId });
      return {
        userId,
        isBot: Boolean(response.user?.is_bot)
      };
    })
  );

  return profiles;
}

export async function getUniqueEligibleUsers(
  client: WebClient,
  channel: string,
  timestamp: string
): Promise<string[]> {
  const userIds = await fetchMessageReactions(client, channel, timestamp);
  const candidates = await hydrateCandidates(client, userIds);
  return normalizeCandidates(candidates);
}

export async function getWeightedEligibleUsers(
  client: WebClient,
  channel: string,
  timestamp: string
): Promise<string[]> {
  const tickets = await fetchMessageReactionTickets(client, channel, timestamp);
  const userIds = [...new Set(tickets)];
  const candidates = await hydrateCandidates(client, userIds);
  const eligibleUsers = new Set(normalizeCandidates(candidates));
  return tickets.filter((ticket) => eligibleUsers.has(ticket));
}
