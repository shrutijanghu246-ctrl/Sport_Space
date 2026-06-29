const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    type: {
      type: String,
      enum: ["post", "log"], // post = instagram style, log = structureed training
      default: "post",
    },
    //for both types
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String, //cloudinary url
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true, //public users can see posts but not logs
    },

    //only for structures logs (type === "log")
    logDetails: {
      date: Date,
      sport: String,
      drillName: String,
      duration: Number, //in minutes
      personalNote: String,
    },

    //likes and comments
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", postSchema);
