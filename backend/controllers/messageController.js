const Message = require("../models/Message");

const getTeamMessages = async (req, res) => {
  try {
    const messages = await Message.find({ team: req.params.teamId })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 }); //oldest first for chat

    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getTeamMessages };
