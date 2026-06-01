import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getIstDateString } from "@/lib/ist";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      articleId?: string;
      voteType?: "GOOD" | "BAD";
      voterId?: string;
      editionDate?: string;
    };

    const { articleId, voteType, voterId } = body;
    const editionDate = body.editionDate ?? getIstDateString();

    if (!articleId || !voteType || !voterId) {
      return NextResponse.json(
        { error: "articleId, voteType, and voterId are required" },
        { status: 400 }
      );
    }

    if (voteType !== "GOOD" && voteType !== "BAD") {
      return NextResponse.json({ error: "Invalid voteType" }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { edition: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.edition.date !== editionDate) {
      return NextResponse.json(
        { error: "Voting is only allowed on today's edition" },
        { status: 400 }
      );
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        articleId_voterId_editionDate: {
          articleId,
          voterId,
          editionDate,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        {
          error: "Already voted",
          goodVotes: article.goodVotes,
          badVotes: article.badVotes,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: {
          articleId,
          voterId,
          voteType,
          editionDate,
        },
      });

      return tx.article.update({
        where: { id: articleId },
        data: {
          goodVotes: voteType === "GOOD" ? { increment: 1 } : undefined,
          badVotes: voteType === "BAD" ? { increment: 1 } : undefined,
        },
      });
    });

    const totalVotes = updated.goodVotes + updated.badVotes;
    const goodPercent =
      totalVotes === 0
        ? 50
        : Math.round((updated.goodVotes / totalVotes) * 100);

    return NextResponse.json({
      goodVotes: updated.goodVotes,
      badVotes: updated.badVotes,
      totalVotes,
      goodPercent,
      badPercent: 100 - goodPercent,
    });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
