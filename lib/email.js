import nodemailer from 'nodemailer';

// Use explicit Gmail SMTP to avoid service autodetection issues
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to, subject, text) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('email_not_configured');
  }

  // Verify SMTP connection/auth before sending to surface clear errors
  await transporter.verify();

  await transporter.sendMail({
    from: `"Campus Connect" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}
