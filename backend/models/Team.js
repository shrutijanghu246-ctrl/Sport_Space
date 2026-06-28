const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, //no two teams can have the same name
    },
    sport: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    captain: {
      boys: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      girls: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    achievements: [
      {
        title: String,
        date: Date,
        competition: String,
      },
    ],
    logo: {
      type: String, //cloudinary url
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true, //team feed visible to non-members
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Team", teamSchema);
