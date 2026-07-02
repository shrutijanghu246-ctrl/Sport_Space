const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Food = require("../models/Food");

const foods = [
  {
    name: "Rice (cooked)",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fats: 0.3,
    category: "grain",
    description: "Staple carbohydrate source, great for pre-workout energy",
  },
  {
    name: "Roti (wheat)",
    calories: 297,
    protein: 9,
    carbs: 57,
    fats: 4,
    category: "grain",
    description: "Whole wheat flatbread, good source of complex carbs",
  },
  {
    name: "Dal (lentils)",
    calories: 116,
    protein: 9,
    carbs: 20,
    fats: 0.4,
    category: "protein",
    description: "High protein plant-based food, rich in iron",
  },
  {
    name: "Chicken breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    category: "protein",
    description: "Lean protein source, ideal for muscle recovery",
  },
  {
    name: "Egg (whole)",
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fats: 11,
    category: "protein",
    description: "Complete protein with all essential amino acids",
  },
  {
    name: "Egg white",
    calories: 52,
    protein: 11,
    carbs: 0.7,
    fats: 0.2,
    category: "protein",
    description: "Pure protein with minimal calories",
  },
  {
    name: "Paneer",
    calories: 265,
    protein: 18,
    carbs: 3.4,
    fats: 20,
    category: "dairy",
    description: "Indian cottage cheese, rich in protein and calcium",
  },
  {
    name: "Milk (full fat)",
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fats: 3.3,
    category: "dairy",
    description: "Complete nutrition with calcium and protein",
  },
  {
    name: "Banana",
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fats: 0.3,
    category: "fruit",
    description:
      "Quick energy source, rich in potassium — great pre/post workout",
  },
  {
    name: "Apple",
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fats: 0.2,
    category: "fruit",
    description: "High in fiber and antioxidants",
  },
  {
    name: "Oats",
    calories: 389,
    protein: 17,
    carbs: 66,
    fats: 7,
    category: "grain",
    description: "Slow-release carbs, perfect pre-workout breakfast",
  },
  {
    name: "Sweet potato",
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fats: 0.1,
    category: "vegetable",
    description: "Complex carbs with vitamins, great for endurance athletes",
  },
  {
    name: "Peanut butter",
    calories: 588,
    protein: 25,
    carbs: 20,
    fats: 50,
    category: "snack",
    description: "Healthy fats and protein, calorie dense for bulking",
  },
  {
    name: "Almonds",
    calories: 579,
    protein: 21,
    carbs: 22,
    fats: 50,
    category: "snack",
    description: "Healthy fats, vitamin E, great recovery snack",
  },
  {
    name: "Greek yogurt",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fats: 0.4,
    category: "dairy",
    description: "High protein dairy, great post-workout",
  },
  {
    name: "Sprouts (moong)",
    calories: 30,
    protein: 3,
    carbs: 6,
    fats: 0.2,
    category: "protein",
    description: "Light protein-rich food, easy to digest",
  },
  {
    name: "Tuna",
    calories: 144,
    protein: 30,
    carbs: 0,
    fats: 1,
    category: "protein",
    description: "Lean protein with omega-3 fatty acids",
  },
  {
    name: "Brown rice",
    calories: 216,
    protein: 5,
    carbs: 45,
    fats: 1.8,
    category: "grain",
    description: "More fiber than white rice, better for sustained energy",
  },
  {
    name: "Coconut water",
    calories: 19,
    protein: 0.7,
    carbs: 3.7,
    fats: 0.2,
    category: "beverage",
    description: "Natural electrolyte drink, great for hydration",
  },
  {
    name: "Protein shake (whey)",
    calories: 120,
    protein: 24,
    carbs: 3,
    fats: 2,
    category: "other",
    description: "Fast-absorbing protein, ideal post-workout",
  },
];

const seedFoods = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    console.log("MongoDB connected ✅");

    await Food.deleteMany({});
    await Food.insertMany(foods);

    console.log(`✅ Seeded ${foods.length} foods successfully!`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedFoods();
