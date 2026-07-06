const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
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
const Message = require("./models/Message");

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinTeam", (teamId) => {
    socket.join(teamId);
    console.log(`Socket ${socket.id} joined team ${teamId}`);
  });

  socket.on("joinUser", (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined personal room ${userId}`);
  });

  //users joins their team's chat room
  socket.on("joinTeam", (teamId) => {
    socket.join(teamId);
    console.log(`Socket ${socket.id} joined team ${teamId}`);
  });

  //listen for new meassages
  socket.on("sendMessage", async ({ teamId, senderId, text }) => {
    try {
      const message = await Message.create({
        team: teamId,
        sender: senderId,
        text,
      });

      const populatedMessage = await message.populate(
        "sender",
        "name profilePic",
      );

      //send to everyone in that team's room (including sender)
      io.to(teamId).emit("receiveMessage", populatedMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
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
    mongoUri: process.env.MONGODB_URI ? "✅ SET" : "❌ NOT SET",
    jwtSecret: process.env.JWT_SECRET ? "✅ SET" : "❌ NOT SET",
    brevoApiKey: process.env.BREVO_API_KEY ? "✅ SET" : "❌ NOT SET",
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || "❌ NOT SET",
    brevoUser: process.env.BREVO_USER ? "✅ SET" : "❌ NOT SET",
    brevoPass: process.env.BREVO_PASS ? "✅ SET" : "❌ NOT SET",
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
      testOTP: testOTP
    });
  } catch (err) {
    console.error("❌ Test email failed:", err.message);
    res.status(500).json({ 
      message: "❌ Failed to send test email",
      error: err.message 
    });
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
