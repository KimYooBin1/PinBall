export function buildDailyRecruitmentMessage(): string {
  return "오점뭐? 저녁 결정자를 뽑습니다. 원하는 이모지로 반응해주세요.";
}

export function buildPinballRecruitmentMessage(winnerCount: number): string {
  return `핀볼 시작. 3분 안에 원하는 이모지로 반응하면 ${winnerCount}명을 뽑습니다.`;
}

export function buildPinballHelpMessage(): string {
  return [
    "PinBall 봇 사용법",
    "- `/pinball <number>`: 3분 뒤 고유한 반응자 중에서 지정한 인원을 추첨합니다.",
    "- `/pinball help`: 이 도움말을 표시합니다.",
    "- 매일 17:00 KST에 `오점뭐?` 메시지를 올리고 17:30 KST에 1명을 뽑습니다.",
    "- 여러 이모지로 반응해도 한 번만 집계되고, 봇 계정은 제외됩니다."
  ].join("\n");
}

export function buildWinnerAnnouncement(winners: string[], context: string): string {
  if (winners.length === 0) {
    return `${context} eligible participants were found.`;
  }

  const mentions = winners.map((winner) => `<@${winner}>`).join(", ");
  return `${context} ${mentions}`;
}
