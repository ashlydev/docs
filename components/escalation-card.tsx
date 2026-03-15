import { LifeBuoy } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EscalationCardProps = {
  supportLink: string;
};

export function EscalationCard({ supportLink }: EscalationCardProps) {
  return (
    <Card className="mt-4 rounded-2xl border-sky-300/[0.15] bg-sky-400/10 p-4 shadow-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-300/10 text-sky-100">
            <LifeBuoy className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sky-50">
              Need human help? Contact support.
            </p>
            <p className="mt-1 text-sm leading-6 text-sky-100/75">
              Use the documented human support path for account-specific work, billing changes, or low-confidence edge cases.
            </p>
          </div>
        </div>
        <a
          className={buttonVariants({
            variant: "secondary",
            size: "sm"
          })}
          href={supportLink}
          rel="noreferrer"
          target="_blank"
        >
          Contact support
        </a>
      </div>
    </Card>
  );
}
