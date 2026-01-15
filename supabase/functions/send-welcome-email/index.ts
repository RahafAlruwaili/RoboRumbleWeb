// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";



// ✅ CORS (مهم جدًا)
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

type WelcomeEmailRequest = {
  email: string;
  fullName: string;
};

serve(async (req: Request): Promise<Response> => {
  // ✅ preflight - Always handle this first
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    // 👇 Hardcoded API Key for immediate fix
    const RESEND_API_KEY = "re_9uHrYGhN_AS6HFKRepN4CNVnbynjTsfwF";

    // Initialize Resend inside handler to prevent crash on startup
    const resend = new Resend(RESEND_API_KEY);

    const { email, fullName } = (await req.json()) as WelcomeEmailRequest;

    if (!email || typeof email !== "string") {
      return jsonResponse({ error: "Missing or invalid email" }, 400);
    }

    const safeName =
      typeof fullName === "string" && fullName.trim().length > 0
        ? fullName.trim()
        : "مشارك";

    const emailResponse = await resend.emails.send({
      from: "RoboRumble <noreply@drcroborumble.com>",
      to: [email],
      subject: "مرحباً بك في RoboRumble! 🤖",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #22d3ee; font-size: 32px; margin: 0;">🤖 RoboRumble</h1>
          </div>

          <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; backdrop-filter: blur(10px);">
            <h2 style="color: #ffffff; text-align: center; margin: 0 0 20px 0;">
              مرحباً ${safeName}! 🎉
            </h2>

            <p style="color: #e2e8f0; font-size: 16px; line-height: 1.8; text-align: center;">
              تم إنشاء حسابك بنجاح في منصة RoboRumble لمسابقات الروبوتات!
            </p>

            <div style="background: rgba(34, 211, 238, 0.2); border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid rgba(34, 211, 238, 0.3);">
              <h3 style="color: #22d3ee; margin: 0 0 15px 0;">🚀 الخطوات التالية:</h3>
              <ul style="color: #e2e8f0; margin: 0; padding-right: 20px; line-height: 2;">
                <li>أكمل ملفك الشخصي</li>
                <li>انضم لفريق موجود أو أنشئ فريقك الخاص</li>
                <li>سجل في ورش العمل المتاحة</li>
                <li>استعد للمنافسة!</li>
              </ul>
            </div>

            <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 20px;">
              نتمنى لك تجربة رائعة ومليئة بالإبداع! 🌟
            </p>
          </div>

          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 20px;">
            فريق RoboRumble
          </p>
        </div>
      `,
    });

    return jsonResponse({ success: true, emailResponse }, 200);
  } catch (error: any) {
    console.error("Error in send-welcome-email:", error);
    return jsonResponse({ error: error?.message ?? "Unknown error" }, 500);
  }
});
