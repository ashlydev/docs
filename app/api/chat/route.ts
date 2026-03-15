import { NextResponse } from "next/server";
import { z } from "zod";

import { answerSupportQuestion } from "@/lib/chat";

export const runtime = "nodejs";

const requestSchema = z.object({
  question: z.string().trim().min(1).max(800)
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    const body = requestSchema.parse(rawBody);
    const response = await answerSupportQuestion(body.question);

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Please send a valid support question."
        },
        {
          status: 400
        }
      );
    }

    console.error("Chat API error", error);

    return NextResponse.json(
      {
        error: "Unable to process the support question."
      },
      {
        status: 500
      }
    );
  }
}
