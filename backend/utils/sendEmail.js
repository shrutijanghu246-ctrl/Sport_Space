const sendOTPEmail = async (email, otp) => {
  try {
    console.log("📧 Sending OTP to:", email);
    console.log(
      "🔑 Using Brevo API Key:",
      process.env.BREVO_API_KEY ? "✅ SET" : "❌ NOT SET",
    );

    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "SportSpace",
          email: process.env.BREVO_SENDER_EMAIL || "noreply@sportspace.com",
        },
        to: [{ email: email }],
        subject: "SportSpace — Verify your email",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <h2 style="color: #1f2937;">🏅 SportSpace</h2>
            <p style="color: #6b7280;">Welcome to NIT KKR's sports platform!</p>
            <p style="color: #6b7280;">Your verification OTP is:</p>
            <div style="background: white; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <h1 style="letter-spacing: 8px; color: #f59e0b; margin: 0; font-size: 36px;">${otp}</h1>
            </div>
            <p style="color: #6b7280;"><strong>⏱️ Expires in: 10 minutes</strong></p>
            <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo API Error:", responseData);
      throw new Error(
        responseData.message ||
          `Email sending failed with status ${response.status}`,
      );
    }

    console.log("✅ OTP Email sent successfully!");
    return responseData;
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    throw err;
  }
};

module.exports = sendOTPEmail;
