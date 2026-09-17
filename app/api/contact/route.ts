import { NextResponse } from "next/server";

/**
 * Contact / "hire us" lead capture.
 * Phase 1 stub: validates and accepts. When the DB is wired, persist to the
 * ContactSubmission table (type: hire | support) so leads show in the admin
 * dashboard inbox, and optionally send a notification email.
 */
export async function POST(req: Request) {
  let body: { type?: string; name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, message } = body;
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }

  // TODO(persist): prisma.contactSubmission.create({ data: { type, name, email, message } })
  console.log("[contact] new lead:", { type: body.type ?? "support", name, email });

  return NextResponse.json({ ok: true });
}
