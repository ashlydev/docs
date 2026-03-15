import { ShieldAlert } from "lucide-react";

import { Card } from "@/components/ui/card";

type FallbackCardProps = {
  message?: string;
};

export function FallbackCard({
  message = "This question is not clearly supported by the available public docs."
}: FallbackCardProps) {
  return (
    <Card className="mt-5 rounded-2xl border-amber-300/[0.15] bg-amber-400/[0.08] p-4 shadow-none">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-300/10 text-amber-100">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-50">Limited documentation match</p>
          <p className="mt-1 text-sm leading-6 text-amber-100/85">{message}</p>
        </div>
      </div>
    </Card>
  );
}
