import nodemailer from "nodemailer";

const twilioConfigured = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER;
const transporter = process.env.SMTP_HOST && process.env.SMTP_USER
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  : null;

export async function sendOtp(phone, otp) {
  if (twilioConfigured) {
    const credentials = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const body = new URLSearchParams({
      To: `+91${phone}`,
      From: process.env.TWILIO_PHONE_NUMBER,
      Body: `Your Kala Beauty Parlour verification code is ${otp}. It expires in 10 minutes.`
    });
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Twilio rejected the OTP SMS (${response.status}): ${details}`);
    }
    return { delivered: true };
  }
  if (!transporter || !process.env.OTP_EMAIL_RECIPIENT) {
    console.warn("OTP delivery is unavailable because no SMS provider is configured");
    return { delivered: false };
  }
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.OTP_EMAIL_RECIPIENT,
    subject: `Kala Beauty Parlour verification code for ${phone}`,
    text: `Your Kala Beauty Parlour verification code is ${otp}. It expires in 10 minutes.`
  });
  return { delivered: true };
}
