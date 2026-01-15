import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TeamNotificationRequest {
  teamId: string;
  status: "approved" | "rejected" | "final_approved";
  teamName: string;
}

const getEmailContent = (status: string, teamName: string, language: string = "ar") => {
  const templates = {
    approved: {
      subject: language === "ar" ? `تهانينا! تم قبول فريق "${teamName}" مبدئياً` : `Congratulations! Team "${teamName}" has been initially accepted`,
      html: language === "ar"
        ? `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e; text-align: center;">🎉 تهانينا!</h1>
            <p style="font-size: 18px; text-align: center;">تم قبول فريق <strong>"${teamName}"</strong> مبدئياً في المسابقة!</p>
            <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">الخطوات التالية:</h3>
              <ul style="margin: 0; padding-right: 20px;">
                <li>يمكنك الآن حضور ورش العمل</li>
                <li>انتظر القبول النهائي للمشاركة في المسابقة</li>
                <li>تأكد من إكمال ملفات التصميم</li>
              </ul>
            </div>
            <p style="text-align: center; color: #666;">بالتوفيق! 🚀</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e; text-align: center;">🎉 Congratulations!</h1>
            <p style="font-size: 18px; text-align: center;">Team <strong>"${teamName}"</strong> has been initially accepted!</p>
            <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Next Steps:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>You can now attend workshops</li>
                <li>Wait for final acceptance to participate</li>
                <li>Make sure to complete design files</li>
              </ul>
            </div>
            <p style="text-align: center; color: #666;">Good luck! 🚀</p>
          </div>
        `,
    },
    final_approved: {
      subject: language === "ar" ? `🏆 تم قبول فريق "${teamName}" نهائياً!` : `🏆 Team "${teamName}" is finally accepted!`,
      html: language === "ar"
        ? `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e; text-align: center;">🏆 مبروك! القبول النهائي!</h1>
            <p style="font-size: 18px; text-align: center;">تم قبول فريق <strong>"${teamName}"</strong> نهائياً في المسابقة!</p>
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">🎯 أنتم الآن جاهزون:</h3>
              <ul style="margin: 0; padding-right: 20px;">
                <li>يمكنكم الآن الدخول لصفحة التحضير</li>
                <li>تأكدوا من الحضور في أيام المسابقة</li>
                <li>مسموح غياب واحد فقط خلال 4 أيام</li>
              </ul>
            </div>
            <p style="text-align: center; color: #666; font-size: 20px;">نراكم في المسابقة! 🤖</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e; text-align: center;">🏆 Congratulations! Final Acceptance!</h1>
            <p style="font-size: 18px; text-align: center;">Team <strong>"${teamName}"</strong> is finally accepted!</p>
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">🎯 You're ready:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>You can now access the Preparation page</li>
                <li>Make sure to attend on competition days</li>
                <li>Only one absence allowed across 4 days</li>
              </ul>
            </div>
            <p style="text-align: center; color: #666; font-size: 20px;">See you at the competition! 🤖</p>
          </div>
        `,
    },
    rejected: {
      subject: language === "ar" ? `إشعار بخصوص فريق "${teamName}"` : `Notification about Team "${teamName}"`,
      html: language === "ar"
        ? `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ef4444; text-align: center;">إشعار مهم</h1>
            <p style="font-size: 18px; text-align: center;">نأسف لإبلاغكم بأن فريق <strong>"${teamName}"</strong> لم يتم قبوله.</p>
            <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0;">للمزيد من المعلومات أو الاستفسار، يرجى التواصل مع المنظمين.</p>
            </div>
            <p style="text-align: center; color: #666;">نتمنى لكم التوفيق في المستقبل.</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ef4444; text-align: center;">Important Notice</h1>
            <p style="font-size: 18px; text-align: center;">We regret to inform you that team <strong>"${teamName}"</strong> was not accepted.</p>
            <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0;">For more information, please contact the organizers.</p>
            </div>
            <p style="text-align: center; color: #666;">We wish you the best in the future.</p>
          </div>
        `,
    },
  };

  return templates[status as keyof typeof templates] || templates.approved;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-team-notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    // 👇 Hardcoded API Key for immediate fix
    const RESEND_API_KEY = "re_9uHrYGhN_AS6HFKRepN4CNVnbynjTsfwF";

    // Check for API key first
    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ error: "Missing RESEND_API_KEY configuration on server" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Resend inside handler
    const resend = new Resend(RESEND_API_KEY);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create Supabase client (this is usually safe at top level but safer here)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { teamId, status, teamName }: TeamNotificationRequest = await req.json();

    console.log(`Sending notification for team ${teamId} with status ${status}`);

    // Get team members with their emails
    const { data: teamMembers, error: membersError } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", teamId);

    if (membersError) {
      console.error("Error fetching team members:", membersError);
      throw membersError;
    }

    if (!teamMembers || teamMembers.length === 0) {
      console.log("No team members found");
      return new Response(
        JSON.stringify({ success: true, message: "No team members to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get emails for team members
    const userIds = teamMembers.map((m) => m.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("email")
      .in("user_id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    const emails = profiles?.map((p) => p.email).filter(Boolean) || [];

    if (emails.length === 0) {
      console.log("No emails found for team members");
      return new Response(
        JSON.stringify({ success: true, message: "No emails to send" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending emails to: ${emails.join(", ")}`);

    const emailContent = getEmailContent(status, teamName);

    // Send email to all team members
    const emailResponse = await resend.emails.send({
      from: Deno.env.get("FROM_EMAIL") ?? "RoboRumble <noreply@drcroborumble.com>",
      to: emails,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-team-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
