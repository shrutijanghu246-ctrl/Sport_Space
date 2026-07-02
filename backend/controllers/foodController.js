const Food = require("../models/Food");

//serach foods
const searchFoods = async (req, res) => {
  try {
    const { query } = req.query;

    const foods = await Food.find({
      name: { $regex: query, $options: "i" }, //case insensitive search
    }).limit(10);

    res.status(200).json({ foods });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//get all foods
const getAllFoods = async (req, res) => {
  try {
    const foods = (await Food.find()).sort({ name: 1 });
    res.status(200).json({ food });
  } catch (err) {
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

    res.status(201).json({ message: "Food added!", food });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { searchFoods, getAllFoods, addFood };
