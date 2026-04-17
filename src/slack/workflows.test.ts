import { describe, expect, it, vi } from "vitest";
import { getUniqueEligibleUsers } from "./reactions.js";
import { handleHelpCommand, handlePinballCommand } from "./workflows.js";

vi.mock("./reactions.js", () => ({
  getUniqueEligibleUsers: vi.fn()
}));

function createCommandArgs(text: string) {
  return {
    ack: vi.fn().mockResolvedValue(undefined),
    respond: vi.fn().mockResolvedValue(undefined),
    client: {
      chat: {
        postMessage: vi.fn().mockResolvedValue({ ts: "123.456" })
      }
    },
    command: {
      text,
      channel_id: "C123"
    }
  } as any;
}

function createLogger() {
  return {
    error: vi.fn(),
    warn: vi.fn()
  } as any;
}

describe("handlePinballCommand", () => {
  it("returns usage guidance when help is sent to `/pinball`", async () => {
    const args = createCommandArgs("help");
    const logger = createLogger();

    await handlePinballCommand(args, logger);

    expect(args.ack).toHaveBeenCalledOnce();
    expect(args.respond).toHaveBeenCalledWith({
      response_type: "ephemeral",
      text: expect.stringContaining("/help")
    });
    expect(args.client.chat.postMessage).not.toHaveBeenCalled();
  });

  it("announces a failure when eligible users are fewer than requested", async () => {
    vi.useFakeTimers();
    vi.mocked(getUniqueEligibleUsers).mockResolvedValue(["U1"]);
    const args = createCommandArgs("2");
    const logger = createLogger();

    await handlePinballCommand(args, logger);
    await vi.runAllTimersAsync();

    expect(args.client.chat.postMessage).toHaveBeenCalledWith({
      channel: "C123",
      text: expect.stringContaining("2명을 뽑아야 하는데 참가자가 1명뿐이에요")
    });
    vi.useRealTimers();
  });
});

describe("handleHelpCommand", () => {
  it("returns an ephemeral help message for `/help`", async () => {
    const args = createCommandArgs("");
    const logger = createLogger();

    await handleHelpCommand(args, logger);

    expect(args.ack).toHaveBeenCalledOnce();
    expect(args.respond).toHaveBeenCalledWith({
      response_type: "ephemeral",
      text: expect.stringContaining("/help")
    });
    expect(args.respond).toHaveBeenCalledWith({
      response_type: "ephemeral",
      text: expect.stringContaining("17:00")
    });
    expect(args.client.chat.postMessage).not.toHaveBeenCalled();
  });
});
