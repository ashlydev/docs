import { ExternalLink } from "lucide-react";

import type { Citation } from "@/types/support-bot";

type CitationListProps = {
  citations: Citation[];
};

export function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 rounded-[22px] border border-white/10 bg-background/35 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow">Sources</p>
        <p className="text-xs text-muted">Public documentation</p>
      </div>
      <div className="mt-4 space-y-2.5">
        {citations.map((citation) => (
          <div
            className="rounded-[18px] border border-white/8 bg-white/[0.03] p-3.5"
            key={citation.id}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text">{citation.sourceTitle}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{citation.snippet}</p>
              </div>
              <a
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted transition hover:border-white/20 hover:bg-white/[0.08] hover:text-text"
                href={citation.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
