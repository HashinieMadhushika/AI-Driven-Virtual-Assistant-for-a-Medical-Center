import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = payload.action;
  if (action !== "request-code" && action !== "verify-code") {
    return NextResponse.json({ error: "Invalid history action." }, { status: 400 });
  }

  const backendBaseUrl = process.env.BACKEND_BASE_URL ?? "http://localhost:5000";
  try {
    const response = await fetch(`${backendBaseUrl}/api/chat/history/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(
        Object.entries(payload).filter(([key]) => key !== "action")
      )),
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Chat history verification is unavailable right now." },
      { status: 503 }
    );
  }
}