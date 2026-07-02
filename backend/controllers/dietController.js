const DietLog = require("../models/DietLog");

//log diet (athlete logs their own diet)
const createDietLog = async (req, res) => {
  try {
    const { date, meals, notes } = req.body;

    const totalCalories = meals.reduce(
      (sum, meal) => sum + (meal.calories || 0),
      0,
    );

    const log = await DietLog.create({
      athlete: req.user._id,
      team: req.user.team,
      date,
      meals,
      totalCalories,
      notes,
    });

    res.status(201).json({ message: "Diet log created!", log });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//get my diet logs
const getMyDietLogs = async (req, res) => {
  try {
    const logs = await DietLog.find({ athlete: req.user._id })
      .populate("athlete", "name sport profilePic")
      .sort({ date: -1 })
      .limit(30);

    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//get team memeber's diet logs(captain/coach only)
const getMemberDietLogs = async (req, res) => {
  try {
    const logs = await DietLog.find({ athlete: req.params.athleteId })
      .populate("athlete", "name sport profilePic")
      .sort({ date: -1 })
      .limit(30);

    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//delete diet log(own only)
const deleteDietLog = async (req, res) => {
  try {
    const log = await DietLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    if (log.athlete.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await log.deleteOne();
    res.status(200).json({ message: "Diet log deleted!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createDietLog,
  getMyDietLogs,
  getMemberDietLogs,
  deleteDietLog,
};
