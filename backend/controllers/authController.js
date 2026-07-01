const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, role, sport } = req.body;

    // Check email
    if (!email.endsWith("@nitkkr.ac.in")) {
      return res
        .status(400)
        .json({ message: "Only NIT KKR email addresses are allowed" });
    }

    //check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      sport,
    });

    //Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    //Send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days in milliseconds
    });

    res.status(201).json({
      message: "User registered successfully",
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

//LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //generate JWT token
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

//logout
const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

//add personal achievemet
const addPersonalAchievement = async (req, res) => {
  try {
    const { title, date } = req.body;
    const foundUser = await User.findById(req.user._id); // renamed to foundUser

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

//delete personal achivement
const deletePersonalAchievement = async (req, res) => {
  try {
    const foundUser = await User.findById(req.user._id); // renamed here too

    foundUser.achievements = foundUser.achievements.filter(
      (a) => a._id.toString() !== req.params.achievementId,
    );
    await foundUser.save();

    res.status(200).json({ message: "Achievement deleted!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  addPersonalAchievement,
  deletePersonalAchievement,
};
