import { ExternalLink } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Citation } from "@/types/support-bot";

type CitationListProps = {
  citations: Citation[];
};

export function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Supporting sources
      </p>
      <div className="grid gap-3">
        {citations.map((citation) => (
          <Card
            className="rounded-2xl border-white/10 bg-surface-2/[0.55] p-4 shadow-none"
            key={citation.id}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-text">{citation.sourceTitle}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{citation.snippet}</p>
              </div>
              <a
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted transition hover:border-sky-300/30 hover:bg-sky-400/10 hover:text-sky-100"
                href={citation.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
