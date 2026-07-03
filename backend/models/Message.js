const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
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
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", //users who deleted this for themselves
      },
    ],
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
