import { NextRequest, NextResponse } from "next/server";
import { getEditionSentiment } from "@/lib/sentiment";
import { getIstDateString } from "@/lib/ist";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? getIstDateString();
  const sentiment = await getEditionSentiment(date);

  if (!sentiment) {
    return NextResponse.json(
      { editionDate: date, goodVotes: 0, badVotes: 0, totalVotes: 0, goodPercent: 50, badPercent: 50 },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(sentiment, {
    headers: { "Cache-Control": "no-store" },
  });
}
