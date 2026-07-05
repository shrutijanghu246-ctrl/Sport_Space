const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "SportSpace", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: email }],
      subject: "SportSpace — Verify your email",
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
          <h2>🏅 SportSpace</h2>
          <p>Welcome to NIT KKR's sports platform!</p>
          <p>Your verification OTP is:</p>
          <h1 style="letter-spacing: 8px; color: #f59e0b;">${otp}</h1>
          <p>This OTP expires in <strong>10 minutes</strong>.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Email sending failed");
  }
};

module.exports = sendOTPEmail;
