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

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
