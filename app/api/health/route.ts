import { NextResponse } from "next/server";

import { getRuntimeStatus } from "@/lib/runtime-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getRuntimeStatus();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...status
    });
  } catch (error) {
    console.error("Health API error", error);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: "degraded",
        issues: [
          error instanceof Error
            ? `Health check failed: ${error.message}`
            : "Health check failed."
        ]
      },
      {
        status: 500
      }
    );
  }
}
