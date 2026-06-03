"use client";

import { useToast } from "./ToastProvider";
import type { NewsLanguage } from "@/lib/language";
import { getUiCopy } from "@/lib/ui-copy";
import { useNewsLanguage } from "@/hooks/use-news-language";

interface ShareButtonProps {
  title: string;
  url: string;
  compact?: boolean;
  language?: NewsLanguage;
}

export function ShareButton({
  title,
  url,
  compact = false,
  language: languageProp,
}: ShareButtonProps) {
  const languageFromUrl = useNewsLanguage();
  const language = languageProp ?? languageFromUrl;
  const ui = getUiCopy(language);
  const { showToast } = useToast();

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast(ui.toast.linkCopied);
    } catch {
      showToast(ui.toast.copyFailed);
    }
  }

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleShare}
          className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:text-stone-400 dark:hover:bg-stone-900/60 dark:hover:text-stone-200 dark:focus-visible:ring-offset-stone-950"
          aria-label={ui.aria.shareArticle(title)}
        >
          <ShareIcon />
        </button>
        <a
          href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:text-stone-400 dark:hover:bg-stone-900/60 dark:hover:text-stone-200 dark:focus-visible:ring-offset-stone-950"
          aria-label={ui.aria.shareWhatsApp}
        >
          <WhatsAppIcon />
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-200 dark:hover:border-stone-700 dark:hover:bg-stone-900/40 dark:focus-visible:ring-offset-stone-950"
        aria-label={ui.aria.shareArticle(title)}
      >
        <ShareIcon />
        {ui.share}
      </button>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-200 dark:hover:border-stone-700 dark:hover:bg-stone-900/40 dark:focus-visible:ring-offset-stone-950"
      >
        WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-200 dark:hover:border-stone-700 dark:hover:bg-stone-900/40 dark:focus-visible:ring-offset-stone-950"
      >
        Post on X
      </a>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.59 13.51 15.42 17.8M15.41 6.2 8.59 10.49M5 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
