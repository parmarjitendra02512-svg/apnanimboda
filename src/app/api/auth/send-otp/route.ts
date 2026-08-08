export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkRateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    // Limit to 3 OTP requests per minute per IP to prevent spam
    const isAllowed = await checkRateLimit(ip, "otp", 3, 60000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again after 1 minute." },
        { status: 429 },
      );
    }

    const { email, otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ error: "Missing OTP" }, { status: 400 });
    }

    if (!email || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      // Graceful fallback for local dev or when Gmail/Email is not provided.
      // Returns success so the visual OTP step in the UI still functions to stop bots.
      return NextResponse.json({
        success: true,
        warning: "Email skipped (credentials or email not configured)",
      });
    }

    // Configure Nodemailer transporter with Gmail
    // Requires App Password from Google Account settings
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Your App Password
      },
    });

    const mailOptions = {
      from: `"Apna Nimboda Security" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Apna Nimboda Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #3b82f6; text-align: center;">Apna Nimboda Verification</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for verification is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; background-color: #e5e7eb; padding: 10px 20px; border-radius: 5px; letter-spacing: 2px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666;">Please do not share this OTP with anyone. It will expire in 5 minutes.</p>
          <hr style="border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">This is an automated security email. Please do not reply.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to email",
    });
  } catch (error: any) {
    console.error("OTP Send error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Check email settings." },
      { status: 500 },
    );
  }
}
