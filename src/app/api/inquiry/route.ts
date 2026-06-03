import { NextResponse } from "next/server";
import { z } from "zod";

const InquirySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(300),
  message: z.string().min(1).max(5000),
  lang: z.enum(["tr", "en"]).optional(),
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = InquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const { name, email, message, lang } = parsed.data;
  const notifyTo = process.env.INQUIRY_NOTIFY_TO;
  const from = process.env.RESEND_FROM ?? "youshimagine <onboarding@resend.dev>";
  const apiKey = process.env.RESEND_API_KEY;

  // Resend opsiyonel; key yoksa sadece logla. Dev'de form çalışsın diye.
  if (!apiKey || !notifyTo) {
    console.log("[inquiry]", { name, email, message, lang });
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: notifyTo,
      replyTo: email,
      subject: `youshimagine — ${name}`,
      text: [
        `Ad: ${name}`,
        `E-posta: ${email}`,
        `Dil: ${lang ?? "?"}`,
        "",
        message,
      ].join("\n"),
    });
    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[inquiry] resend error", err);
    return NextResponse.json({ error: "send" }, { status: 502 });
  }
}
