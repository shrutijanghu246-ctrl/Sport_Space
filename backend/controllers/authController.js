const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTPEmail = require("../utils/sendEmail");

// helper to generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, role, sport } = req.body;

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
      isVerified: false,
      otp: { code: otp, expiresAt: otpExpiresAt },
    });

    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "Registration successful! Please check your email for OTP.",
      userId: user._id,
    });
  } catch (err) {
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
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sport: user.sport,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// LOGOUT
const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

// VERIFY OTP
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otp.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please register again." });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Email verified successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sport: user.sport,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// RESEND OTP
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };
    await user.save();

    await sendOTPEmail(user.email, otp);

    res.status(200).json({ message: "OTP resent successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
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
    const profileUser = await User.findById(req.params.userId).select(
      "-password -email",
    );

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
  login,
  logout,
  verifyOTP,
  resendOTP,
  addPersonalAchievement,
  deletePersonalAchievement,
  getPublicProfile,
};
