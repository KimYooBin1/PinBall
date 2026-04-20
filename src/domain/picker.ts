export interface Candidate {
  userId: string;
  isBot: boolean;
}

export function normalizeCandidates(candidates: Candidate[]): string[] {
  const uniqueUsers = new Set<string>();

  for (const candidate of candidates) {
    if (candidate.isBot) {
      continue;
    }

    uniqueUsers.add(candidate.userId);
  }

  return [...uniqueUsers];
}

export function drawWinners(
  candidates: string[],
  winnerCount: number,
  random: () => number = Math.random
): string[] {
  if (winnerCount < 1) {
    throw new Error("Winner count must be at least 1.");
  }

  if (winnerCount > candidates.length) {
    throw new Error(
      `Requested ${winnerCount} winners but only ${candidates.length} candidates are available.`
    );
  }

  const pool = [...candidates];
  const winners: string[] = [];

  while (winners.length < winnerCount) {
    const index = Math.floor(random() * pool.length);
    winners.push(pool.splice(index, 1)[0]);
  }

  return winners;
}

export function drawWeightedWinners(
  tickets: string[],
  winnerCount: number,
  random: () => number = Math.random
): string[] {
  const uniqueCandidates = [...new Set(tickets)];

  if (winnerCount < 1) {
    throw new Error("Winner count must be at least 1.");
  }

  if (winnerCount > uniqueCandidates.length) {
    throw new Error(
      `Requested ${winnerCount} winners but only ${uniqueCandidates.length} candidates are available.`
    );
  }

  let pool = [...tickets];
  const winners: string[] = [];

  while (winners.length < winnerCount) {
    const index = Math.floor(random() * pool.length);
    const winner = pool[index];
    winners.push(winner);
    pool = pool.filter((ticket) => ticket !== winner);
  }

  return winners;
}
