const mongoose = require("mongoose");

const mongooseSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: "true",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      requireed: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
