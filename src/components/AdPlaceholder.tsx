interface AdPlaceholderProps {
  slot: string;
}

export function AdPlaceholder({ slot }: AdPlaceholderProps) {
  return (
    <div
      className="my-6 flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-xs text-stone-500"
      aria-hidden="true"
      data-ad-slot={slot}
    >
      {/* Future AdSense slot: {slot} — reserved to avoid CLS; do not inject until configured */}
      Ad slot reserved ({slot})
    </div>
  );
}
