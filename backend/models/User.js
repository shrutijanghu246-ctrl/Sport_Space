const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "captain", "vice_captain", "coach", "member"],
      default: "member",
    },
    sport: {
      type: String, // e.g. "Athletics", "Football", "Basketball"
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team", // links to Team model
    },
    profilePic: {
      type: String, // Cloudinary URL
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    achievements: [
      {
        title: String,
        date: Date,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: false,
    },
  },
  { timestamps: true },
); // adds createdAt and updatedAt automatically

module.exports = mongoose.model("User", userSchema);
