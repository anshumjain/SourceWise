import { prisma } from "./db";
import { getIstDateString } from "./ist";
import type { SentimentSnapshot } from "./types";

export type { SentimentSnapshot };

export function toSentimentSnapshot(
  editionDate: string,
  goodVotes: number,
  badVotes: number
): SentimentSnapshot {
  const totalVotes = goodVotes + badVotes;
  const goodPercent =
    totalVotes === 0 ? 50 : Math.round((goodVotes / totalVotes) * 100);

  return {
    editionDate,
    goodVotes,
    badVotes,
    totalVotes,
    goodPercent,
    badPercent: 100 - goodPercent,
  };
}

export async function getEditionSentiment(
  editionDate?: string
): Promise<SentimentSnapshot | null> {
  const date = editionDate ?? getIstDateString();

  const articles = await prisma.article.findMany({
    where: { edition: { date } },
    select: { goodVotes: true, badVotes: true },
  });

  if (articles.length === 0) return null;

  const goodVotes = articles.reduce((sum, article) => sum + article.goodVotes, 0);
  const badVotes = articles.reduce((sum, article) => sum + article.badVotes, 0);
  return toSentimentSnapshot(date, goodVotes, badVotes);
}

export async function getEditionSentimentAfterVote(editionDate: string) {
  return getEditionSentiment(editionDate);
}
