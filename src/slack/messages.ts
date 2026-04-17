export function buildDailyRecruitmentMessage(): string {
  return "오점뭐? 오늘 저녁 운명을 정할 사람을 뽑습니다. 참여하려면 아무 이모지나 톡 남겨주세요.";
}

export function buildPinballRecruitmentMessage(winnerCount: number): string {
  return `핀볼 굴러갑니다. 3분 안에 이모지로 탑승하면 ${winnerCount}명을 뽑아요. 늦으면 다음 판입니다.`;
}

export function buildPinballHelpMessage(): string {
  return [
    "핀볼 사용법",
    "- `/pinball <number>`: 3분 동안 이모지 참가자를 모으고, 지정한 인원을 랜덤으로 뽑아요.",
    "- `/help`: 지금 보고 있는 도움말을 다시 보여줘요.",
    "- 매일 17:00 KST에는 `오점뭐?` 모집을 열고, 17:30 KST에는 저녁 결정자 1명을 뽑습니다.",
    "- 이모지를 여러 개 눌러도 한 명으로만 세고, 봇 계정은 조용히 제외합니다."
  ].join("\n");
}

export function buildWinnerAnnouncement(winners: string[], context: string): string {
  if (winners.length === 0) {
    return `${context}: 아직 참가자가 없어요. 이모지 요정들이 조금 더 필요합니다.`;
  }

  const mentions = winners.map((winner) => `<@${winner}>`).join(", ");
  return `${context}: ${mentions} 님 당첨입니다. 오늘의 운명은 맡겼어요.`;
}

export function buildInsufficientParticipantsMessage(
  requestedCount: number,
  availableCount: number
): string {
  return `핀볼 추첨: ${requestedCount}명을 뽑아야 하는데 참가자가 ${availableCount}명뿐이에요. 이번 판은 무효입니다. 리액션을 더 모아볼까요?`;
}
