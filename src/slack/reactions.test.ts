import { describe, expect, it, vi } from "vitest";
import { getWeightedEligibleUsers } from "./reactions.js";

describe("getWeightedEligibleUsers", () => {
  it("keeps one ticket per emoji reaction and excludes bots", async () => {
    const client = {
      reactions: {
        get: vi.fn().mockResolvedValue({
          message: {
            reactions: [
              { name: "rice", users: ["U1", "U2"] },
              { name: "ramen", users: ["U1", "B1"] }
            ]
          }
        })
      },
      users: {
        info: vi.fn(async ({ user }) => ({
          user: {
            id: user,
            is_bot: user === "B1"
          }
        }))
      }
    } as any;

    const tickets = await getWeightedEligibleUsers(client, "C1", "123.456");

    expect(tickets).toEqual(["U1", "U2", "U1"]);
  });
});
