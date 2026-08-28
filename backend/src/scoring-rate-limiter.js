import crypto from "node:crypto";
import { Firestore } from "@google-cloud/firestore";

function rateLimitError(message) {
  return Object.assign(new Error(message), { code: "RATE_LIMITED" });
}

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function scoringRateLimits(environment = process.env) {
  return {
    perMinute: positiveInteger(environment.SCORING_LIMIT_PER_MINUTE, 5),
    perUserDay: positiveInteger(environment.SCORING_LIMIT_PER_USER_DAY, 20),
    perIpDay: positiveInteger(environment.SCORING_LIMIT_PER_IP_DAY, 40),
    globalDay: positiveInteger(environment.SCORING_LIMIT_GLOBAL_DAY, 500),
  };
}

function utcDay(now) {
  return now.toISOString().slice(0, 10);
}

function minuteWindow(now) {
  return now.toISOString().slice(0, 16);
}

function keyHash(value, salt = "") {
  return crypto.createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32);
}

function quotaEntries(input, limits, salt, now) {
  const day = utcDay(now);
  return [
    {
      key: `minute-${minuteWindow(now)}-${keyHash(input.userId, salt)}`,
      limit: limits.perMinute,
      message: "AIレビューの連続実行が多すぎます。1分後にもう一度お試しください。",
      expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    },
    {
      key: `user-${day}-${keyHash(input.userId, salt)}`,
      limit: limits.perUserDay,
      message: "本日のAIレビュー利用上限に達しました。明日もう一度お試しください。",
      expiresAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      key: `ip-${day}-${keyHash(input.ipAddress || "unknown", salt)}`,
      limit: limits.perIpDay,
      message: "この接続元からの本日のAIレビュー利用上限に達しました。",
      expiresAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      key: `global-${day}`,
      limit: limits.globalDay,
      message: "本日のAIレビュー提供上限に達しました。明日もう一度お試しください。",
      expiresAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    },
  ];
}

export class MemoryScoringRateLimiter {
  constructor(options = {}) {
    this.limits = options.limits || scoringRateLimits();
    this.salt = options.salt || "";
    this.now = options.now || (() => new Date());
    this.counters = new Map();
  }

  async consume(input) {
    const now = this.now();
    const entries = quotaEntries(input, this.limits, this.salt, now);
    for (const entry of entries) {
      const current = this.counters.get(entry.key) || 0;
      if (current >= entry.limit) {
        throw rateLimitError(entry.message);
      }
    }
    entries.forEach((entry) => {
      this.counters.set(entry.key, (this.counters.get(entry.key) || 0) + 1);
    });
  }
}

export class FirestoreScoringRateLimiter {
  constructor(options = {}) {
    this.limits = options.limits || scoringRateLimits();
    this.salt = options.salt || "";
    this.now = options.now || (() => new Date());
    this.firestore = options.firestore || new Firestore();
    this.collectionName = options.collectionName || "akamain_scoring_rate_limits";
  }

  async consume(input) {
    const now = this.now();
    const entries = quotaEntries(input, this.limits, this.salt, now);
    const references = entries.map((entry) =>
      this.firestore.collection(this.collectionName).doc(entry.key)
    );
    await this.firestore.runTransaction(async (transaction) => {
      const snapshots = await Promise.all(references.map((reference) => transaction.get(reference)));
      entries.forEach((entry, index) => {
        const current = snapshots[index].exists ? Number(snapshots[index].data()?.count || 0) : 0;
        if (current >= entry.limit) {
          throw rateLimitError(entry.message);
        }
      });
      entries.forEach((entry, index) => {
        const current = snapshots[index].exists ? Number(snapshots[index].data()?.count || 0) : 0;
        transaction.set(references[index], {
          count: current + 1,
          updatedAt: now,
          expiresAt: entry.expiresAt,
        });
      });
    });
  }
}

export function createScoringRateLimiter(options = {}) {
  const driver = String(options.driver || process.env.RATE_LIMIT_DRIVER || "memory").toLowerCase();
  const common = {
    limits: options.limits || scoringRateLimits(),
    salt: options.salt ?? process.env.RATE_LIMIT_SALT ?? "",
    now: options.now,
  };
  return driver === "firestore"
    ? new FirestoreScoringRateLimiter({ ...common, firestore: options.firestore })
    : new MemoryScoringRateLimiter(common);
}
