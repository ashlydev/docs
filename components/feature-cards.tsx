import { BarChart3, BookOpenText, Files, ShieldAlert } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

const featureIcons = [Files, BookOpenText, ShieldAlert, BarChart3];

export function FeatureCards() {
  return (
    <section className="section-shell mt-10 md:mt-14">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {siteConfig.featureCards.map((feature, index) => {
          const Icon = featureIcons[index];

          return (
            <Card key={feature.title} className="group h-full border-white/10 bg-white/[0.025]">
              <CardHeader>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sky-200 transition group-hover:-translate-y-0.5 group-hover:border-sky-300/20 group-hover:bg-sky-400/10">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
