function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)));
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, " "));
}

export function extractArticleText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const articleMatch = withoutScripts.match(
    /<article[\s\S]*?<\/article>/i,
  );
  const scope = articleMatch?.[0] ?? withoutScripts;

  const paragraphs = [...scope.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripTags(match[1]).replace(/\s+/g, " ").trim())
    .filter((text) => text.length > 40);

  if (paragraphs.length >= 2) {
    return paragraphs.join("\n\n");
  }

  const ogDescription = withoutScripts.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
  );
  if (ogDescription?.[1]) {
    return decodeHtmlEntities(ogDescription[1]).trim();
  }

  const metaDescription = withoutScripts.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  );
  if (metaDescription?.[1]) {
    return decodeHtmlEntities(metaDescription[1]).trim();
  }

  const fallback = stripTags(scope).replace(/\s+/g, " ").trim();
  return fallback.slice(0, 4000);
}
