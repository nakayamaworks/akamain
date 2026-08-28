import assert from "node:assert/strict";
import test from "node:test";
import { MemoryScoringRateLimiter } from "../src/scoring-rate-limiter.js";

function limiter(options = {}) {
  return new MemoryScoringRateLimiter({
    limits: {
      perMinute: 2,
      perUserDay: 3,
      perIpDay: 4,
      globalDay: 5,
      ...options.limits,
    },
    now: options.now || (() => new Date("2026-08-28T01:00:00.000Z")),
    salt: "test-salt",
  });
}

test("scoring limiter rejects a third review by the same user in one minute", async () => {
  const subject = limiter();
  await subject.consume({ userId: "user-1", ipAddress: "192.0.2.1" });
  await subject.consume({ userId: "user-1", ipAddress: "192.0.2.1" });
  await assert.rejects(
    subject.consume({ userId: "user-1", ipAddress: "192.0.2.1" }),
    (error) => error.code === "RATE_LIMITED" && error.message.includes("1分後")
  );
});

test("scoring limiter combines user, IP, and global daily limits", async () => {
  const subject = limiter({ limits: { perMinute: 10, perUserDay: 10, perIpDay: 2, globalDay: 10 } });
  await subject.consume({ userId: "user-1", ipAddress: "192.0.2.1" });
  await subject.consume({ userId: "user-2", ipAddress: "192.0.2.1" });
  await assert.rejects(
    subject.consume({ userId: "user-3", ipAddress: "192.0.2.1" }),
    (error) => error.code === "RATE_LIMITED" && error.message.includes("接続元")
  );
});

test("scoring limiter opens a new window on the next day", async () => {
  let now = new Date("2026-08-28T23:59:00.000Z");
  const subject = limiter({
    limits: { perMinute: 10, perUserDay: 1, perIpDay: 10, globalDay: 10 },
    now: () => now,
  });
  await subject.consume({ userId: "user-1", ipAddress: "192.0.2.1" });
  now = new Date("2026-08-29T00:01:00.000Z");
  await subject.consume({ userId: "user-1", ipAddress: "192.0.2.1" });
});
