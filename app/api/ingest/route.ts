import { NextResponse } from "next/server";
import { z } from "zod";

import { getSourceSetByKey } from "@/lib/demo-sources";
import {
  env,
  getLlmConfigIssues,
  hasLlmConfig,
  hasSupabaseConfig
} from "@/lib/env";
import { ingestPublicSources } from "@/lib/ingest";

export const runtime = "nodejs";

const requestSchema = z.object({
  sourceSet: z.string().optional(),
  sourceSetKey: z.string().optional(),
  urls: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url()
      })
    )
    .optional(),
  force: z.boolean().optional()
});

function getProvidedSecret(request: Request) {
  const bearer = request.headers.get("authorization");

  if (bearer?.startsWith("Bearer ")) {
    return bearer.replace("Bearer ", "").trim();
  }

  return request.headers.get("x-ingestion-secret")?.trim();
}

export async function POST(request: Request) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json(
        {
          error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured before ingestion."
        },
        {
          status: 500
        }
      );
    }

    if (!hasLlmConfig()) {
      return NextResponse.json(
        {
          error:
            getLlmConfigIssues().join(" ") ||
            "The active provider must be configured before ingestion."
        },
        {
          status: 500
        }
      );
    }

    if (!env.INGESTION_SECRET) {
      return NextResponse.json(
        {
          error: "INGESTION_SECRET is not configured."
        },
        {
          status: 500
        }
      );
    }

    if (getProvidedSecret(request) !== env.INGESTION_SECRET) {
      return NextResponse.json(
        {
          error: "Unauthorized."
        },
        {
          status: 401
        }
      );
    }

    const body = requestSchema.parse(await request.json().catch(() => ({})));
    const sourceSet = getSourceSetByKey(body.sourceSet ?? body.sourceSetKey);
    const sources = body.urls ?? sourceSet.sources;
    const results = await ingestPublicSources(sources, {
      force: body.force
    });

    return NextResponse.json({
      sourceSet: sourceSet.label,
      results
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid ingestion payload."
        },
        {
          status: 400
        }
      );
    }

    console.error("Ingest API error", error);

    return NextResponse.json(
      {
        error: "Failed to ingest support docs."
      },
      {
        status: 500
      }
    );
  }
}
