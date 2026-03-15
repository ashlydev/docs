import { LifeBuoy } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EscalationCardProps = {
  supportLink: string;
};

export function EscalationCard({ supportLink }: EscalationCardProps) {
  return (
    <Card className="mt-4 rounded-[22px] border-[rgba(204,176,137,0.18)] bg-[rgba(204,176,137,0.08)] p-4 shadow-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(204,176,137,0.12)] text-[#ead9bf]">
            <LifeBuoy className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f3e8d8]">Need help from support?</p>
            <p className="mt-1 text-sm leading-6 text-[#d8c7af]">
              For account-specific actions or billing changes, continue with the human support path.
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
