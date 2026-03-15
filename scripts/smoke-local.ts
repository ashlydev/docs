type CheckStatus = "pass" | "fail" | "skip";

type CheckResult = {
  name: string;
  status: CheckStatus;
  detail: string;
};

const appBaseUrl = process.env.APP_BASE_URL ?? "http://127.0.0.1:3000";

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${appBaseUrl}${path}`, init);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${path} returned ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

async function main() {
  const results: CheckResult[] = [];

  const homepage = await fetch(appBaseUrl);
  const homepageHtml = await homepage.text();
  results.push({
    name: "Homepage responds",
    status: homepage.ok && homepageHtml.includes("Docs-Based Support Bot for Scheduling SaaS") ? "pass" : "fail",
    detail: homepage.ok ? "Homepage returned the expected heading." : `Homepage returned ${homepage.status}.`
  });

  const health = await getJson<{
    status: string;
    knowledgeBaseReady?: boolean;
    issues?: string[];
  }>("/api/health");
  results.push({
    name: "Health endpoint responds",
    status: health.status === "ok" || health.status === "degraded" ? "pass" : "fail",
    detail:
      health.status === "ok"
        ? "Runtime health reported ok."
        : `Runtime health reported degraded${health.issues?.length ? `: ${health.issues.join(" | ")}` : "."}`
  });

  const unsafeQuestions = [
    "Can you cancel my subscription for me?",
    "Refund me now.",
    "Can you access my account?",
    "Change my billing details directly."
  ];

  for (const question of unsafeQuestions) {
    const response = await getJson<{
      answerStatus: string;
      escalationSuggested: boolean;
    }>("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    results.push({
      name: `Unsafe question refusal: ${question}`,
      status:
        response.answerStatus === "refused" && response.escalationSuggested
          ? "pass"
          : "fail",
      detail: `Received answerStatus=${response.answerStatus}, escalationSuggested=${response.escalationSuggested}.`
    });
  }

  const supportedQuestions = [
    "What plans are available?",
    "How do I contact support?",
    "Which plan is best for a small team?",
    "How do billing details work?"
  ];

  for (const question of supportedQuestions) {
    const response = await getJson<{
      answerStatus: string;
      citations: unknown[];
    }>("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    if (!health.knowledgeBaseReady) {
      results.push({
        name: `Supported question smoke: ${question}`,
        status: "skip",
        detail:
          "Grounded-answer verification skipped because the knowledge base is not fully configured and indexed."
      });
      continue;
    }

    results.push({
      name: `Supported question smoke: ${question}`,
      status:
        response.answerStatus === "grounded" && response.citations.length > 0
          ? "pass"
          : "fail",
      detail: `Received answerStatus=${response.answerStatus}, citations=${response.citations.length}.`
    });
  }

  const weakQuestion = await getJson<{
    answerStatus: string;
    fallbackTriggered: boolean;
  }>("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question: "What is your office snack policy?"
    })
  });

  results.push({
    name: "Weak retrieval fallback",
    status:
      weakQuestion.answerStatus === "fallback" && weakQuestion.fallbackTriggered
        ? "pass"
        : "fail",
    detail: `Received answerStatus=${weakQuestion.answerStatus}, fallbackTriggered=${weakQuestion.fallbackTriggered}.`
  });

  console.table(results);

  if (results.some((result) => result.status === "fail")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Smoke test failed.");
  console.error(error);
  process.exitCode = 1;
});
