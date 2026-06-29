const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
      ssl: true,
    });
    console.log("MongoDb connected successfully");
  } catch (err) {
    console.log("MongoDB connection failed", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
