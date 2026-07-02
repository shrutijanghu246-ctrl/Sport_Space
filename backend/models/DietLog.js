const mongoose = require("mongoose");

const dietLogSchema = new mongoose.Schema(
  {
    athlete: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    meals: [
      {
        name: String,
        calories: Number,
        protein: Number, //in grams
        carbs: Number, //in grams
        fats: Number, //in grams
      },
    ],
    totalCalories: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timeStamps: true },
);

module.exports = mongoose.model("DietLog", dietLogSchema);
