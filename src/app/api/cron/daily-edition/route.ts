import { NextRequest, NextResponse } from "next/server";
import { publishDailyEdition, runCronPhase } from "@/lib/edition";
import { parseCronPhase } from "@/lib/cron-phases";
import { getIstDateString } from "@/lib/ist";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phaseParam = parseCronPhase(
    request.nextUrl.searchParams.get("phase"),
  );
  const date = getIstDateString();

  try {
    if (phaseParam === "full" || phaseParam === null) {
      const edition = await publishDailyEdition(date);
      return NextResponse.json({
        success: true,
        mode: "full",
        date: edition.date,
        articleCount: edition.articles.length,
      });
    }

    const result = await runCronPhase(phaseParam, date);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Daily edition cron failed:", error);
    return NextResponse.json(
      { error: "Failed to publish daily edition" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
