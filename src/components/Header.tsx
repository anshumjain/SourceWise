import Link from "next/link";
import { Suspense } from "react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 font-serif text-lg font-semibold text-white shadow-sm dark:bg-stone-50 dark:text-stone-900">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-stone-900 sm:text-xl dark:text-stone-50">
              Sourcewise
            </span>
            <span className="hidden text-xs text-stone-500 sm:block dark:text-stone-400">
              Facts as they happened
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Suspense
            fallback={
              <div className="h-8 w-[7.5rem] rounded-full bg-stone-100 dark:bg-stone-900/60" />
            }
          >
            <LanguageToggle />
          </Suspense>
          <ThemeToggle />
          <Link
            href="/about"
            className="rounded-full px-3 py-1.5 text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:text-stone-300 dark:hover:bg-stone-900/50 dark:hover:text-stone-50 dark:focus-visible:ring-offset-stone-950"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="rounded-full px-3 py-1.5 text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:text-stone-300 dark:hover:bg-stone-900/50 dark:hover:text-stone-50 dark:focus-visible:ring-offset-stone-950"
          >
            Privacy
          </Link>
        </nav>
      </div>
    </header>
  );
}
