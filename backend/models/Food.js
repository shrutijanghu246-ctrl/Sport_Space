const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    calories: {
      type: Number,
      required: true, //per 100g
    },
    protein: {
      type: Number,
      default: 0, //grams per 100g
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fats: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      ennum: [
        "grain",
        "protein",
        "dairy",
        "vegetable",
        "snack",
        "beverage",
        "other",
      ],
      default: "other",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Food", foodSchema);
