// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PasswordResetEmailRequest {
  email: string;
  redirectTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-password-reset-email function called");

  // ✅ preflight - Always handle this first
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    // 👇 Hardcoded API Key for immediate fix
    const RESEND_API_KEY = "re_9uHrYGhN_AS6HFKRepN4CNVnbynjTsfwF";

    // Initialize Resend
    const resend = new Resend(RESEND_API_KEY);

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { email, redirectTo }: PasswordResetEmailRequest = await req.json();

    console.log(`Generating password reset link for: ${email}`);
    if (redirectTo) console.log(`Redirecting to: ${redirectTo}`);

    // Generate Link using Supabase Admin API
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: redirectTo
      }
    });

    if (linkError) {
      console.error("Error generating link:", linkError);
      throw linkError;
    }

    const resetLink = linkData.properties.action_link;
    console.log(`Generated reset link: ${resetLink}`);

    console.log(`Sending password reset email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "RoboRumble <noreply@drcroborumble.com>",
      to: [email],
      subject: "طلب إعادة تعيين كلمة المرور 🔐",
      html: `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #0f172a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #22d3ee; font-size: 32px; margin: 0; font-weight: 800; letter-spacing: -0.025em;">🤖 RoboRumble</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px; background-color: #0f172a;">
            <h2 style="color: #f8fafc; text-align: center; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">
              🔐 إعادة تعيين كلمة المرور
            </h2>
            
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. انقر على الزر أدناه لتعيين كلمة مرور جديدة.
            </p>
            
            <!-- Button -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetLink}" style="display: inline-block; background-color: #22d3ee; color: #0f172a; font-weight: 700; font-size: 16px; padding: 16px 32px; border-radius: 12px; text-decoration: none; transition: all 0.2s;">
                تغيير كلمة المرور
              </a>
            </div>

            <!-- Warning -->
            <div style="background: rgba(251, 191, 36, 0.1); border-radius: 12px; padding: 16px; margin: 30px 0; border: 1px solid rgba(251, 191, 36, 0.2);">
              <p style="color: #fbbf24; margin: 0; text-align: center; font-size: 14px;">
                ⚠️ إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني بأمان. هذا الرابط صالح لمدة 24 ساعة فقط.
              </p>
            </div>
            
            <div style="border-top: 1px solid #1e293b; margin: 30px 0;"></div>

            <!-- Security Tips -->
            <div style="background: rgba(30, 41, 59, 0.5); border-radius: 12px; padding: 20px;">
              <h3 style="color: #94a3b8; margin: 0 0 15px 0; text-align: center; font-size: 16px;">💡 نصائح أمان:</h3>
              <ul style="color: #cbd5e1; margin: 0; padding-right: 20px; line-height: 1.8; font-size: 14px;">
                <li>استخدم كلمة مرور قوية وفريدة</li>
                <li>لا تشارك كلمة مرورك مع أي شخص</li>
                <li>تأكد من تسجيل الخروج من الأجهزة المشتركة</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #020617; padding: 20px; text-align: center;">
            <p style="color: #475569; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} RoboRumble. جميع الحقوق محفوظة.
            </p>
            <p style="color: #475569; font-size: 12px; margin: 5px 0 0 0;">
              هذه رسالة آلية، يرجى عدم الرد عليها.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
