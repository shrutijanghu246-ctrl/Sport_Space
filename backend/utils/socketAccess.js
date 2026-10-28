const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Team = require("../models/Team");

const { createHash } = require("node:crypto");
const RevokedSocketSession = require("../models/RevokedSocketSession");
const tokenHash = (token) => createHash("sha256").update(token).digest("hex");

const validId = (id) =>
  typeof id === "string" && mongoose.isObjectIdOrHexString(id);

const readSession = async (token) => {
  if (typeof token !== "string" || !token) throw new Error("Missing session");
  const now = Date.now();
  if (await RevokedSocketSession.exists({ tokenHash: tokenHash(token) })) {
    throw new Error("Session ended");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!validId(decoded.id) || !Number.isFinite(decoded.exp)) {
    throw new Error("Invalid session");
  }
  if (decoded.exp * 1000 <= now) throw new Error("Session expired");
  return decoded;
};

const currentSocketUser = async (socket) => {
  const decoded = await readSession(socket.data.token);
  if (decoded.id !== socket.data.userId) throw new Error("Invalid identity");
  const user = await User.findById(decoded.id)
    .select("_id team isVerified")
    .lean();
  if (!user || user.isVerified !== true) throw new Error("Account unavailable");
  // Recheck after the database wait in case logout or expiry happened meanwhile.
  await readSession(socket.data.token);
  return user;
};

const isTeamMember = async (user, teamId) => {
  if (!validId(teamId) || String(user.team) !== teamId) return false;
  return Boolean(await Team.exists({ _id: teamId, members: user._id }));
};

const canUseTeam = async (socket, teamId) => {
  const user = await currentSocketUser(socket);
  const allowed = await isTeamMember(user, teamId);
  await readSession(socket.data.token);
  return allowed;
};

const authenticateSocket = async (socket) => {
  const decoded = await readSession(socket.request.cookies?.token);
  socket.data.token = socket.request.cookies.token;
  socket.data.userId = decoded.id;
  await currentSocketUser(socket);
};

const armExpiry = (socket) => {
  let timer;
  const schedule = async () => {
    try {
      const decoded = await readSession(socket.data.token);
      if (socket.disconnected) return;
      timer = setTimeout(
        schedule,
        Math.min(decoded.exp * 1000 - Date.now(), 2147483647),
      );
      timer.unref?.();
    } catch {
      socket.disconnect(true);
    }
  };
  socket.on("disconnect", () => clearTimeout(timer));
  schedule();
};

const emitTeamEvent = async (io, teamId, event, payload) => {
  if (!io || !validId(teamId)) return;
  const sockets = await io.in(teamId).fetchSockets();
  await Promise.all(
    sockets.map(async (socket) => {
      try {
        if (!(await canUseTeam(socket, teamId))) {
          await socket.leave(teamId);
          return;
        }
        socket.emit(event, payload);
      } catch {
        socket.disconnect(true);
      }
    }),
  );
};

const emitUserEvent = async (io, userId, event, payload, teamId) => {
  if (!io || !validId(userId)) return;
  const sockets = await io.in(userId).fetchSockets();
  await Promise.all(
    sockets.map(async (socket) => {
      try {
        if (socket.data.userId !== userId) {
          await socket.leave(userId);
          return;
        }
        const user = await currentSocketUser(socket);
        if (teamId && !(await isTeamMember(user, teamId))) return;
        await readSession(socket.data.token);
        socket.emit(event, payload);
      } catch {
        socket.disconnect(true);
      }
    }),
  );
};

const endSocketSession = async (io, token) => {
  if (!token) return;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (Number.isFinite(decoded.exp) && decoded.exp * 1000 > Date.now()) {
      await RevokedSocketSession.updateOne(
        { tokenHash: tokenHash(token) },
        { $set: { expiresAt: new Date(decoded.exp * 1000) } },
        { upsert: true },
      );
    }
  } catch (err) {
    if (
      err.name !== "JsonWebTokenError" &&
      err.name !== "TokenExpiredError" &&
      err.name !== "NotBeforeError"
    ) {
      throw err;
    }
  }
  if (!io) return;
  for (const socket of io.of("/").sockets.values()) {
    if (socket.data.token === token) socket.disconnect(true);
  }
};

const evictUserTeamSockets = async (io, userId) => {
  if (!io || !validId(userId)) return;
  const sockets = await io.in(userId).fetchSockets();
  for (const socket of sockets) {
    for (const room of socket.rooms) {
      if (room !== socket.id && room !== userId) await socket.leave(room);
    }
  }
};

module.exports = {
  authenticateSocket,
  armExpiry,
  canUseTeam,
  emitTeamEvent,
  emitUserEvent,
  endSocketSession,
  evictUserTeamSockets,
};
