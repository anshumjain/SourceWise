import { NextResponse } from "next/server";
import { extractArticleText } from "@/lib/extract-article-text";
import { parseReadableUrl } from "@/lib/read-url";

export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 12000;
const USER_AGENT =
  "Sourcewise/1.0 (+https://sourcewise.in; article reader proxy)";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const url = parseReadableUrl(rawUrl);
  if (!url) {
    return NextResponse.json({ error: "Invalid or blocked url" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Publisher returned ${response.status}` },
        { status: 502 },
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "Publisher did not return HTML" },
        { status: 502 },
      );
    }

    const html = await response.text();
    const content = extractArticleText(html);

    if (!content || content.length < 80) {
      return NextResponse.json(
        { error: "Could not extract readable article text" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      url: url.toString(),
      content,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Request timed out"
        : "Failed to fetch article";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
