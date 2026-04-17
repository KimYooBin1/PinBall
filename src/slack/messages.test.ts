import { describe, expect, it } from "vitest";
import {
  buildDailyRecruitmentMessage,
  buildInsufficientParticipantsMessage,
  buildPinballHelpMessage,
  buildPinballRecruitmentMessage,
  buildWinnerAnnouncement
} from "./messages.js";

describe("Slack bot messages", () => {
  it("uses playful Korean copy for daily recruitment", () => {
    expect(buildDailyRecruitmentMessage()).toContain("오점뭐?");
    expect(buildDailyRecruitmentMessage()).toContain("이모지");
  });

  it("uses playful Korean copy for slash-command recruitment", () => {
    expect(buildPinballRecruitmentMessage(2)).toContain("2명");
    expect(buildPinballRecruitmentMessage(2)).toContain("3분");
  });

  it("explains help in Korean", () => {
    expect(buildPinballHelpMessage()).toContain("핀볼 사용법");
    expect(buildPinballHelpMessage()).toContain("/pinball <number>");
    expect(buildPinballHelpMessage()).toContain("/help");
    expect(buildPinballHelpMessage()).not.toContain("/pinball help");
  });

  it("announces no participants in Korean", () => {
    expect(buildWinnerAnnouncement([], "핀볼 추첨")).toBe(
      "핀볼 추첨: 아직 참가자가 없어요. 이모지 요정들이 조금 더 필요합니다."
    );
  });

  it("announces winners in Korean with mentions", () => {
    expect(buildWinnerAnnouncement(["U1", "U2"], "오늘의 저녁 결정자")).toBe(
      "오늘의 저녁 결정자: <@U1>, <@U2> 님 당첨입니다. 오늘의 운명은 맡겼어요."
    );
  });

  it("announces insufficient participants in Korean", () => {
    expect(buildInsufficientParticipantsMessage(3, 1)).toBe(
      "핀볼 추첨: 3명을 뽑아야 하는데 참가자가 1명뿐이에요. 이번 판은 무효입니다. 리액션을 더 모아볼까요?"
    );
  });
});
