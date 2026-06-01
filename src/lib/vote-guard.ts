import { createHash } from "crypto";
import { NextRequest } from "next/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function hashVoterIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "local";
  const salt = process.env.VOTE_IP_SALT ?? "sourcewise-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24);
}

export function isValidVoterId(voterId: string): boolean {
  return UUID_PATTERN.test(voterId) || voterId.startsWith("voter-");
}
