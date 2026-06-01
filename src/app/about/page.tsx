import type { Metadata } from "next";
import { RSS_SOURCES } from "@/lib/fetch-news";

export const metadata: Metadata = {
  title: "About Sourcewise",
  description:
    "Facts-only daily news from India. Reader judgment via community votes, not editorial endorsement.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl font-semibold text-stone-900 dark:text-stone-50">
        About Sourcewise
      </h1>
      <p className="mt-4 text-lg text-stone-700 dark:text-stone-300">
        No political bias — present facts as they happened; let readers judge
        for themselves.
      </p>

      <section className="mt-10 space-y-4 text-stone-700 dark:text-stone-300">
        <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-50">
          Our mission
        </h2>
        <p>
          Sourcewise is a daily India news edition focused on factual reporting:
          who, what, when, and where. We avoid editorializing, spin, loaded
          adjectives, and predictions framed as fact.
        </p>
        <p>
          The community sentiment bar asks &quot;Is this good for the
          country?&quot; so readers can share perspective. Those votes are not
          editorial endorsements — they reflect aggregated reader sentiment only.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-stone-700 dark:text-stone-300">
        <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-50">
          How we summarize
        </h2>
        <p>
          Each summary is capped at about 100 words and sticks to verified
          facts from the original report. When automated summarization is used,
          a strict facts-only prompt is applied. Every card links to the original
          source — we never replace attribution with AI-only text.
        </p>
        <p>
          We filter likely opinion pieces using simple heuristics (tags or URLs
          containing words like &quot;opinion&quot;, &quot;editorial&quot;, or
          &quot;analysis&quot;). This can produce false positives; sources and
          methods are documented in the README.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-stone-700 dark:text-stone-300">
        <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-50">
          Sources (MVP)
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          {RSS_SOURCES.map((source) => (
            <li key={source.url}>
              <span className="font-medium">{source.name}</span> —{" "}
              <a
                href={source.url}
                className="text-emerald-700 hover:underline dark:text-emerald-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                RSS feed
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Optional fallback: NewsAPI.org (country=in). Respect robots.txt and
          each publisher&apos;s terms of use.
        </p>
      </section>
    </div>
  );
}
