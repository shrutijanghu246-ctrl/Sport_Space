const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sport: {
      type: String,
      required: true, //"Athletics", "Football", "General", etc.
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    sets: Number,
    reps: Number,
    duration: Number, //in minutes, for cardio exercises
    musclesTargeted: [String], //e.g. ["hamstrings", "core"]
    tips: String, //form tips/coaching notes
  },
  { timestamps: true },
);

module.exports = mongoose.model("Exercise", exerciseSchema);
