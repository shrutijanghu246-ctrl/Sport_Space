const Message = require("../models/Message");

const getTeamMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      team: req.params.teamId,
      deletedForEveryone: false, //hide deleted for everyone
      deletedFor: { $nin: [req.user._id] }, //hide deleted for me
    })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 }); //oldest first for chat

    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//delete for me
const deleteForMe = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (!message.deletedFor.includes(req.user._id)) {
      message.deletedFor.push(req.user._id);
      await message.save();
    }

    res.status(200).json({ message: "Deleted for you" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//delete for every one (sender only)
const deleteForEveryone = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only sender can delete for everyone" });
    }

    message.deletedForEveryone = true;
    message.text = "This message was deleted";
    await message.save();

    // Emit to everyone in team room
    const io = req.app.get("io");
    io.to(message.team.toString()).emit("messageDeleted", {
      messageId: message._id,
      deletedForEveryone: true,
    });

    res.status(200).json({ message: "Deleted for everyone" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getTeamMessages, deleteForMe, deleteForEveryone };
