import { NextRequest, NextResponse } from "next/server";
import { getCurrentEdition } from "@/lib/edition";
import { buildEditionResponse } from "@/lib/edition-response";
import { formatEditionDate } from "@/lib/ist";
import { parseLanguage } from "@/lib/language";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const language = parseLanguage(request.nextUrl.searchParams.get("lang"));
  const edition = await getCurrentEdition(language);

  if (!edition || edition.articles.length === 0) {
    return NextResponse.json({ error: "No edition published yet" }, { status: 404 });
  }

  const response = buildEditionResponse(edition, language);
  response.formattedDate = formatEditionDate(edition.date);

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
