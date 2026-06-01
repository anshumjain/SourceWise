import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Sourcewise handles votes, cookies, and local storage.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl font-semibold text-stone-900 dark:text-stone-50">
        Privacy
      </h1>

      <section className="mt-8 space-y-4 text-stone-700 dark:text-stone-300">
        <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-50">
          Voting
        </h2>
        <p>
          Each browser may cast one vote per story per day. Votes are stored
          with a random local ID and a hashed network identifier to limit abuse.
          Votes contribute to today&apos;s live sentiment bar and are reset when
          the feed refreshes at 9:00 AM IST.
        </p>
        <p>
          This is not fraud-proof. Shared devices, cleared storage, VPNs, or
          automated tools may skew results. Stronger protections (accounts,
          CAPTCHA) may be added later.
        </p>
      </section>

      <section className="mt-8 space-y-4 text-stone-700 dark:text-stone-300">
        <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-50">
          Data retention
        </h2>
        <p>
          Sourcewise keeps only the current daily edition. When the next edition
          publishes, prior articles and their votes are deleted. Same-day
          aggregates show overall reader sentiment while the edition is live.
        </p>
      </section>

      <section className="mt-8 space-y-4 text-stone-700 dark:text-stone-300">
        <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-50">
          Cookies & storage
        </h2>
        <p>
          Sourcewise stores a voter identifier and layout preference in
          localStorage. No advertising cookies are enabled in the MVP.
        </p>
      </section>
    </div>
  );
}
