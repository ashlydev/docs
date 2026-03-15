import "./load-env";
import { getSourceSetByKey } from "../lib/demo-sources";
import { getLlmConfigIssues, hasLlmConfig, hasSupabaseConfig } from "../lib/env";
import { ingestPublicSources } from "../lib/ingest";
import type { IngestSource } from "../types/support-bot";

type ParsedArgs = {
  sourceSetKey?: string;
  force: boolean;
  urls: string[];
};

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    force: false,
    urls: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === "--force") {
      parsed.force = true;
      continue;
    }

    if (current === "--set" || current === "--source-set") {
      parsed.sourceSetKey = argv[index + 1];
      index += 1;
      continue;
    }

    if (current.startsWith("--set=") || current.startsWith("--source-set=")) {
      parsed.sourceSetKey = current.split("=")[1];
      continue;
    }

    if (current === "--url") {
      const url = argv[index + 1];

      if (url) {
        parsed.urls.push(url);
        index += 1;
      }

      continue;
    }

    if (current.startsWith("--url=")) {
      parsed.urls.push(current.split("=")[1]);
    }
  }

  return parsed;
}

function toCustomSources(urls: string[]): IngestSource[] {
  return urls.map((url, index) => ({
    label: `Custom source ${index + 1}`,
    url
  }));
}

async function main() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured before ingestion."
    );
  }

  if (!hasLlmConfig()) {
    throw new Error(
      getLlmConfigIssues().join(" ") ||
        "The active provider must be configured before ingestion."
    );
  }

  const args = parseArgs(process.argv.slice(2));
  const sourceSet = getSourceSetByKey(args.sourceSetKey);
  const sources = args.urls.length > 0 ? toCustomSources(args.urls) : sourceSet.sources;

  console.log(
    `Ingesting ${sources.length} sources from ${args.urls.length > 0 ? "custom input" : sourceSet.label}...`
  );

  const results = await ingestPublicSources(sources, {
    force: args.force
  });

  console.table(
    results.map((result) => ({
      status: result.status,
      chunks: result.chunks,
      title: result.title,
      url: result.url,
      error: result.error ?? ""
    }))
  );

  if (results.some((result) => result.status === "failed")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Seed ingestion failed.");
  console.error(error);
  process.exitCode = 1;
});
