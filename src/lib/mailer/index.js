import "server-only";
import nodemailer from "nodemailer";
import { getEnv, hasSmtpConfiguration } from "@/lib/env";

export async function sendRegistrationOtp(email, code) {
  const env = getEnv();
  if (!hasSmtpConfiguration(env)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and MAIL_FROM.");
    }
    console.info(`[development] Registration code for ${email}: ${code}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject: "Your law firm registration code",
    text: `Your registration code is ${code}. It expires in 10 minutes. If you did not request it, you can ignore this email.`,
  });
}

export async function sendClientNotice(email, template) {
  try {
    const env = getEnv();
    if (!hasSmtpConfiguration(env)) {
      if (process.env.NODE_ENV === "production") return;
      console.info(`[development] Email notice for ${email}: ${template.subject}`);
      return;
    }
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    await transporter.sendMail({ from: env.MAIL_FROM, to: email, subject: template.subject, text: template.text });
  } catch (error) {
    console.error("Client email notification failed:", error.message);
  }
}
