const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendOTPEmail = require("../utils/sendEmail");
const { endSocketSession } = require("../utils/socketAccess");
const mongoose = require("mongoose");

// helper to generate OTP
const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

// SAVE OWN GENDER (only when it is missing)
const updateGender = async (req, res) => {
  try {
    const { gender } = req.body;
    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender" });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, gender: null },
      { $set: { gender } },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res
        .status(400)
        .json({ message: "Gender is already saved on this account" });
    }

    res.status(200).json({
      message: "Gender saved",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sport: user.sport,
        team: user.team,
        gender: user.gender,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, role, sport, gender } = req.body;
    const allowedRoles = ["member", "captain", "vice_captain", "coach"];
    if (role !== undefined && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid registration role" });
    }

    if (gender !== undefined && !["male", "female"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      sport,
      gender,
      isVerified: false,
      otp: { code: otp, expiresAt: otpExpiresAt, lastSentAt: new Date() },
    });

    console.log("User created in DB:", user._id);
    console.log("Attempting to send OTP to:", email);

    try {
      await sendOTPEmail(email, otp);
      console.log("OTP email sent successfully!");
    } catch (emailErr) {
      console.error("CRITICAL: Email sending failed:", emailErr.message);
    }

    res.status(201).json({
      message: "Registration successful! Please check your email for OTP.",
      userId: user._id,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isVerified === false) {
      return res.status(400).json({
        message: "Please verify your email first",
        userId: user._id,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sport: user.sport,
        team: user.team,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// LOGOUT
const logout = async (req, res) => {
  try {
    await endSocketSession(req.app.get("io"), req.cookies?.token);
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch {
    res
      .status(503)
      .json({ message: "Logout could not finish. Please try again." });
  }
};

// VERIFY OTP
const MAX_OTP_ATTEMPTS = 5;

// After the database rejects an OTP update, re-read and give the honest reason.
const otpStateError = async (userId) => {
  const again = await User.findById(userId).select("isVerified otp").lean();
  if (!again) return [404, { message: "User not found" }];
  if (again.isVerified) return [400, { message: "User already verified" }];
  if (!again.otp || !again.otp.code) {
    return [400, { message: "No OTP found. Please request a new one." }];
  }
  if (!(again.otp.expiresAt > new Date())) {
    return [400, { message: "OTP expired. Please request a new one." }];
  }
  if ((again.otp.attempts || 0) >= MAX_OTP_ATTEMPTS) {
    return [
      400,
      { message: "Too many incorrect attempts. Please request a new OTP." },
    ];
  }
  return [
    400,
    { message: "This code is no longer valid. Please request a new one." },
  ];
};

//Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!mongoose.isObjectIdOrHexString(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const otpText =
      typeof otp === "string" || typeof otp === "number" ? String(otp) : "";
    if (!/^\d{6}$/.test(otpText)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (!user.otp || !user.otp.code) {
      return res
        .status(400)
        .json({ message: "No OTP found. Please request a new one." });
    }

    const now = new Date();
    if (!(user.otp.expiresAt > now)) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    if ((user.otp.attempts || 0) >= MAX_OTP_ATTEMPTS) {
      return res.status(400).json({
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // Anything below is decided atomically by the database, never by this
    // copy of the user: same account, still unverified, still this exact OTP
    // (code + the time it was issued), unexpired at the moment the database
    // applies the update ($$NOW is the server's own clock), and still under
    // the guess limit. Two requests at the same moment cannot both win, and
    // a guess can never push the counter past the limit.
    const codeOnRecord = String(user.otp.code);
    const issuedOnRecord = user.otp.expiresAt;
    const eligible = {
      _id: user._id,
      isVerified: false,
      "otp.code": codeOnRecord,
      "otp.expiresAt": issuedOnRecord,
      $expr: { $gt: ["$otp.expiresAt", "$$NOW"] },
      $or: [
        { "otp.attempts": { $exists: false } },
        { "otp.attempts": { $lt: MAX_OTP_ATTEMPTS } },
      ],
    };

    if (codeOnRecord === otpText) {
      const verifiedUser = await User.findOneAndUpdate(
        eligible,
        { $set: { isVerified: true }, $unset: { otp: "" } },
        { returnDocument: "after" },
      );
      if (!verifiedUser) {
        const [status, body] = await otpStateError(userId);
        return res.status(status).json(body);
      }

      const token = jwt.sign(
        { id: verifiedUser._id, role: verifiedUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json({
        message: "Email verified successfully!",
        user: {
          id: verifiedUser._id,
          _id: verifiedUser._id,
          name: verifiedUser.name,
          email: verifiedUser.email,
          role: verifiedUser.role,
          sport: verifiedUser.sport,
          team: verifiedUser.team,
        },
      });
    }

    // Wrong code: count this guess atomically against this exact OTP.
    const guessed = await User.findOneAndUpdate(
      eligible,
      { $inc: { "otp.attempts": 1 } },
      { returnDocument: "after" },
    );
    if (!guessed) {
      const [status, body] = await otpStateError(userId);
      return res.status(status).json(body);
    }

    const attemptsLeft = MAX_OTP_ATTEMPTS - (guessed.otp.attempts || 0);
    if (attemptsLeft <= 0) {
      return res.status(400).json({
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    return res
      .status(400)
      .json({ message: `Invalid OTP. ${attemptsLeft} attempts left.` });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// RESEND OTP
const RESEND_COOLDOWN_MS = 60 * 1000;

const resendOTP = async (req, res) => {
  try {
    console.log("🔄 Resend OTP request");
    const { userId } = req.body;

    if (!mongoose.isObjectIdOrHexString(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const otp = generateOTP();

    // One atomic database decision, like verifyOTP: same account, still
    // unverified, and either no OTP was ever sent or the last one went out
    // at least a minute ago on the database server's own clock ($$NOW).
    // Two resends at the same moment cannot both win, and a resend can
    // never land on an account that verified in the meantime.
    const updated = await User.findOneAndUpdate(
      {
        _id: userId,
        isVerified: false,
        $or: [
          { "otp.lastSentAt": { $exists: false } },
          {
            $expr: {
              $lte: [
                "$otp.lastSentAt",
                { $subtract: ["$$NOW", RESEND_COOLDOWN_MS] },
              ],
            },
          },
        ],
      },
      {
        $set: {
          "otp.code": otp,
          "otp.expiresAt": new Date(Date.now() + 10 * 60 * 1000),
          "otp.attempts": 0,
        },
        // the sent time is stamped by the database server's own clock -
        // the same clock the cooldown check above compares against
        $currentDate: { "otp.lastSentAt": true },
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      // The database refused - re-read only to give the honest reason.
      const again = await User.findById(userId).select("isVerified otp").lean();
      if (!again) {
        return res.status(404).json({ message: "User not found" });
      }
      if (again.isVerified) {
        return res.status(400).json({ message: "User already verified" });
      }
      // The only other reason the update was refused: a code went out less
      // than a minute ago. That code stays valid - nothing was changed.
      const lastSentAt = again.otp && again.otp.lastSentAt;
      const waitSeconds = lastSentAt
        ? Math.max(
            1,
            Math.ceil(
              (lastSentAt.getTime() + RESEND_COOLDOWN_MS - Date.now()) / 1000,
            ),
          )
        : 60;
      return res.status(429).json({
        message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
      });
    }

    console.log("📧 Resending OTP to:", updated.email);
    try {
      await sendOTPEmail(updated.email, otp);
      console.log("✅ Resend OTP email sent successfully!");
    } catch (emailErr) {
      console.error("❌ CRITICAL: Resend email failed:", emailErr.message);
    }

    res.status(200).json({ message: "OTP resent successfully!" });
  } catch (err) {
    console.error("RESEND OTP ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD PERSONAL ACHIEVEMENT
const addPersonalAchievement = async (req, res) => {
  try {
    const { title, date } = req.body;
    const foundUser = await User.findById(req.user._id);

    foundUser.achievements.push({ title, date });
    await foundUser.save();

    res.status(201).json({
      message: "Achievement added!",
      achievements: foundUser.achievements,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE PERSONAL ACHIEVEMENT
const deletePersonalAchievement = async (req, res) => {
  try {
    const foundUser = await User.findById(req.user._id);

    foundUser.achievements = foundUser.achievements.filter(
      (a) => a._id.toString() !== req.params.achievementId,
    );
    await foundUser.save();

    res.status(200).json({ message: "Achievement deleted!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET PUBLIC PROFILE
const getPublicProfile = async (req, res) => {
  try {
    const profileUser = await User.findOne({
      _id: req.params.userId,
      isVerified: true,
    })
      .select("_id name role sport team profilePic bio achievements createdAt")
      .populate("team", "name");
    if (!profileUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const Post = require("../models/Post");
    const posts = await Post.find({
      author: profileUser._id,
      isPublic: true,
      type: "post",
    })
      .populate("author", "name sport profilePic")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ profileUser, posts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  register,
  updateGender,
  login,
  logout,
  verifyOTP,
  resendOTP,
  addPersonalAchievement,
  deletePersonalAchievement,
  getPublicProfile,
};
