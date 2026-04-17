export function buildDailyRecruitmentMessage(): string {
  return "오점뭐? 저녁 결정자를 뽑습니다. 원하는 이모지로 반응해주세요.";
}

export function buildPinballRecruitmentMessage(winnerCount: number): string {
  return `핀볼 시작. 3분 안에 원하는 이모지로 반응하면 ${winnerCount}명을 뽑습니다.`;
}

export function buildWinnerAnnouncement(winners: string[], context: string): string {
  if (winners.length === 0) {
    return `${context} eligible participants were found.`;
  }

  const mentions = winners.map((winner) => `<@${winner}>`).join(", ");
  return `${context} ${mentions}`;
}
