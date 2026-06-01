import { NextRequest, NextResponse } from "next/server";
import { publishDailyEdition } from "@/lib/edition";
import { getIstDateString } from "@/lib/ist";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const date = getIstDateString();
    const edition = await publishDailyEdition(date);

    return NextResponse.json({
      success: true,
      date: edition.date,
      articleCount: edition.articles.length,
    });
  } catch (error) {
    console.error("Daily edition cron failed:", error);
    return NextResponse.json(
      { error: "Failed to publish daily edition" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
