const Food = require("../models/Food");

//search foods
const searchFoods = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 1) {
      console.log("❌ Empty search query");
      return res.status(400).json({ message: "Query is required", foods: [] });
    }

    console.log("🔍 Searching foods for:", query);
    const foods = await Food.find({
      name: { $regex: query, $options: "i" }, //case insensitive search
    }).limit(10);

    console.log("✅ Found", foods.length, "foods for query:", query);
    res.status(200).json({ foods });
  } catch (err) {
    console.error("❌ SEARCH FOODS ERROR:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//get all foods
const getAllFoods = async (req, res) => {
  try {
    console.log("📋 Fetching all foods");
    const foods = (await Food.find()).sort({ name: 1 });
    console.log("✅ Found", foods.length, "foods");
    res.status(200).json({ foods });
  } catch (err) {
    console.error("❌ GET ALL FOODS ERROR:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//add food(admin only - to maintain quality)
const addFood = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats, category, description } =
      req.body;

    const existing = await Food.findOne({
      name: { $regex: `^${name}`, $options: "i" },
    });
    if (existing) {
      return res.status(400).json({ message: "Food already exists" });
    }

    const food = await Food.create({
      name,
      calories,
      protein,
      carbs,
      fats,
      category,
      description,
    });

    console.log("✅ Food added:", food.name);
    res.status(201).json({ message: "Food added!", food });
  } catch (err) {
    console.error("❌ ADD FOOD ERROR:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { searchFoods, getAllFoods, addFood };
