const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "SportSpace - Verify your email",
    html: `<div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2>🏅 SportSpace</h2>
        <p>Welcome to NIT KKR's sports platform!</p>
        <p>Your verification OTP is:</p>
        <h1 style="letter-spacing: 8px; color: #2563eb;">${otp}</h1>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 0.85rem;">If you didn't register, ignore this email.</p>
      </div>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;
