import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/[0.04] text-text",
        accent: "border-[rgba(204,176,137,0.28)] bg-[rgba(204,176,137,0.12)] text-[#e9dcc7]",
        warning: "border-[rgba(183,145,98,0.26)] bg-[rgba(183,145,98,0.12)] text-[#e0c39f]",
        success: "border-[rgba(138,164,134,0.26)] bg-[rgba(138,164,134,0.12)] text-[#d8e3d4]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
