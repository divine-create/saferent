import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "SafeRent <noreply@saferent.ng>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "https://saferent-gamma.vercel.app";

export async function sendVerificationEmail(email: string, token: string, firstName: string) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your SafeRent email address",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
        <div style="margin-bottom:24px;">
          <span style="font-size:22px;font-weight:800;color:#0F7B5A;">SafeRent</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#111827;margin:0 0 8px;">Welcome, ${firstName}!</h1>
        <p style="color:#6B7280;margin:0 0 24px;">Please verify your email address to activate your account.</p>
        <a href="${url}" style="display:inline-block;background:#0F7B5A;color:#fff;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;">Verify Email Address</a>
        <p style="color:#9CA3AF;font-size:13px;margin:24px 0 0;">This link expires in 24 hours. If you didn't sign up for SafeRent, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, firstName: string) {
  const url = `${BASE_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your SafeRent password",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
        <div style="margin-bottom:24px;">
          <span style="font-size:22px;font-weight:800;color:#0F7B5A;">SafeRent</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#111827;margin:0 0 8px;">Reset your password</h1>
        <p style="color:#6B7280;margin:0 0 24px;">Hi ${firstName}, click the button below to set a new password.</p>
        <a href="${url}" style="display:inline-block;background:#0F7B5A;color:#fff;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;">Reset Password</a>
        <p style="color:#9CA3AF;font-size:13px;margin:24px 0 0;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
