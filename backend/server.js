const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dns = require("dns");
const http = require("http");
const { Server } = require("socket.io");

if (
  process.env.LOCAL_TEST_MODE !== "1" &&
  process.env.NODE_ENV !== "production"
) {
  require("dotenv").config();
}

// Must run BEFORE connectDB() so Mongoose's SRV lookup uses these DNS servers
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = require("./config/db");
connectDB();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "https://sport-space-frontend.onrender.com",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

//middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const postRoutes = require("./routes/postRoutes");
app.set("io", io); //make io accessible in controllers
app.use("/api/posts", postRoutes);

//test routes
app.get("/", (req, res) => {
  res.send("SportSpace API is running");
});

const teamRoutes = require("./routes/teamRoutes");
app.use("/api/teams", teamRoutes);

//socket.io
// Authenticated real-time chat and notifications
const Message = require("./models/Message");
const {
  authenticateSocket,
  armExpiry,
  canUseTeam,
  emitTeamEvent,
} = require("./utils/socketAccess");

io.use((socket, next) => {
  const origin = socket.handshake.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    return next(new Error("Origin not allowed"));
  }
  cookieParser()(socket.request, {}, (cookieError) => {
    if (cookieError) return next(new Error("Authentication required"));
    authenticateSocket(socket).then(
      () => next(),
      () => next(new Error("Authentication required")),
    );
  });
});

io.on("connection", (socket) => {
  socket.join(socket.data.userId);
  armExpiry(socket);

  // Kept for compatibility with the existing frontend, but never trusts its ID.
  socket.on("joinUser", (userId) => {
    if (userId === socket.data.userId) socket.join(socket.data.userId);
  });

  socket.on("joinTeam", async (teamId) => {
    try {
      if (!(await canUseTeam(socket, teamId))) {
        if (typeof teamId === "string") await socket.leave(teamId);
        return;
      }
      await socket.join(teamId);
    } catch {
      socket.emit("chatError", { message: "Unable to join team chat" });
    }
  });

  socket.on("sendMessage", async (payload) => {
    try {
      if (!payload || typeof payload !== "object") return;
      const { teamId, text } = payload;
      if (typeof text !== "string" || !text.trim()) return;
      if (!(await canUseTeam(socket, teamId))) return;

      const message = await Message.create({
        team: teamId,
        sender: socket.data.userId,
        text: text.trim(),
      });
      const populated = await message.populate("sender", "name profilePic");
      await emitTeamEvent(io, teamId, "receiveMessage", populated);
    } catch {
      socket.emit("chatError", { message: "Unable to send message" });
    }
  });
});

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const dietRoutes = require("./routes/dietRoutes");
app.use("/api/diet", dietRoutes);

const exerciseRoutes = require("./routes/exerciseRoutes");
app.use("/api/exercises", exerciseRoutes);

const foodRoutes = require("./routes/foodRoutes");
app.use("/api/foods", foodRoutes);

// DEBUG ENDPOINT - CHECK BREVO CONFIGURATION
app.get("/debug", (req, res) => {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    mongoUri: process.env.MONGODB_URI ? "SET" : "NOT SET",
    jwtSecret: process.env.JWT_SECRET ? "SET" : "NOT SET",
    brevoApiKey: process.env.BREVO_API_KEY ? "SET" : "NOT SET",
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || "NOT SET",
    brevoUser: process.env.BREVO_USER ? "SET" : "NOT SET",
    brevoPass: process.env.BREVO_PASS ? "SET" : "NOT SET",
  };
  res.json(config);
});

// TEST BREVO EMAIL ENDPOINT
app.post("/test-otp-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("🧪 Testing OTP email to:", email);

    const testOTP = "123456";
    const sendOTPEmail = require("./utils/sendEmail");

    await sendOTPEmail(email, testOTP);

    res.status(200).json({
      message: "✅ Test OTP email sent successfully!",
      testEmail: email,
      testOTP: testOTP,
    });
  } catch (err) {
    console.error("❌ Test email failed:", err.message);
    res.status(500).json({
      message: "❌ Failed to send test email",
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
