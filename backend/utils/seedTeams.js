const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Team = require("../models/Team");

const sports = [
  "Athletics",
  "Football",
  "Cricket",
  "Basketball",
  "Volleyball",
  "Badminton",
  "Table Tennis",
  "Chess",
  "Swimming",
  "Kabaddi",
  "Kho Kho",
  "Tennis",
  "Hockey",
  "Wrestling",
  "Weightlifting",
];

const seedTeams = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    console.log("MongoDB connected ✅");

    for (const sport of sports) {
      const exists = await Team.findOne({ name: sport });
      if (exists) {
        console.log(`⏭️  ${sport} already exists, skipping`);
        continue;
      }
      await Team.create({
        name: sport,
        sport,
        description: `NIT KKR ${sport} Team`,
      });
      console.log(`✅ Created ${sport}`);
    }
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedTeams();
