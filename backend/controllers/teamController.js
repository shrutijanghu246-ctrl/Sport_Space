const Team = require("../models/Team");
const User = require("../models/User");

//create team(admin only)
const createTeam = async (req, res) => {
  try {
    const { name, sport, description } = req.body;

    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: "Team already exists" });
    }

    const team = await Team.create({ name, sport, description });

    res.status(201).json({ message: "Team created successfully", team });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

//GET ALL TEAMS(public)
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("captain.boys", "name email sport")
      .populate("captain.girls", "name email sport")
      .populate("coach", "name email")
      .select("-members"); //don't expose member list publicly

    res.status(200).json({ teams });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//get single team(public)
const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("captain.boys", "name sport profilePic")
      .populate("captain.girls", "name sport profilePic")
      .populate("coach", "name profilePic")
      .populate("members", "name sport profilePic");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({ team });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//add member to team(captain only)
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    //check if already a member
    if (team.members.includes(userId)) {
      return res.status(400).json({ message: "User already in team" });
    }

    team.members.push(userId);
    await team.save();

    //also update the user's team field
    await User.findByIdAndUpdate(userId, { team: team._id });

    res.status(200).json({ message: "Member added successfully", team });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//remove member
const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.members = team.members.filter(
      (member) => member.toString() !== userId,
    );
    await team.save();

    await User.findByIdAndUpdate(userId, { team: null });

    res.status(200).json({ message: "Mmeber removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//add team achievements(captain/admin only)
const addAchievement = async (req, res) => {
  try {
    const { title, competition, date } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.achievements.push({ title, competition, date });
    await team.save();

    res.status(201).json({ message: "Achievement added successfuly", team });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//delete team acheievment (captain/admin only)
const deleteAchievement = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.achievements = team.achievements.filter(
      (a) => a._id.toString() !== req.params.achievementId,
    );

    await team.save();
    res.status(200).json({ message: "Achievement deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createTeam,
  getAllTeams,
  getTeam,
  addMember,
  removeMember,
  addAchievement,
  deleteAchievement,
};
