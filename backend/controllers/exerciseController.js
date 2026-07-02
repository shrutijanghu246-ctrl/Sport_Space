const Exercise = require("../models/Exercise");

//add exercise(coach/captain only)
const addExercise = async (req, res) => {
  try {
    const {
      name,
      sport,
      description,
      difficulty,
      sets,
      reps,
      duration,
      musclesTargeted,
      tips,
    } = req.body;

    const exercise = await Exercise.create({
      name,
      sport,
      team: req.user.team,
      addedBy: req.user._id,
      description,
      difficulty,
      sets,
      reps,
      duration,
      musclesTargeted,
      tips,
    });

    await exercise.populate("addedBy", "name role");
    res.status(201).json({ message: "Exercise added!", exercise });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//get team exercises (all team members)
const getTeamExercises = async (req, res) => {
  try {
    const { sport } = req.query; //optional filter by sport

    const filter = { team: req.user.team };
    if (sport) filter.sport = sport;

    const exercises = await Exercise.find(filter)
      .populate("addedBy", "name role")
      .sort({ createdBy: -1 });

    res.status(200).json({ exercises });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//delete exercise(coach/captain/admin only)
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    await exercise.deleteOne();
    res.status(200).json({ message: "Exercise deleted!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { addExercise, getTeamExercises, deleteExercise };
