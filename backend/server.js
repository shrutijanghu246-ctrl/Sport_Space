const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

//middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const postRoutes = require("./routes/postRoutes");
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

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
