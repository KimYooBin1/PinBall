import { describe, expect, it, vi } from "vitest";
import { handlePinballCommand } from "./workflows.js";

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
  it("returns an ephemeral help message for `/pinball help`", async () => {
    const args = createCommandArgs("help");
    const logger = createLogger();

    await handlePinballCommand(args, logger);

    expect(args.ack).toHaveBeenCalledOnce();
    expect(args.respond).toHaveBeenCalledWith({
      response_type: "ephemeral",
      text: expect.stringContaining("/pinball <number>")
    });
    expect(args.respond).toHaveBeenCalledWith({
      response_type: "ephemeral",
      text: expect.stringContaining("17:00")
    });
    expect(args.client.chat.postMessage).not.toHaveBeenCalled();
  });
});
