const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();
router.param("id", validateObjectId("id"));
router.param("teamId", validateObjectId("teamId"));
const {
  getTeamMessages,
  deleteForMe,
  deleteForEveryone,
} = require("../controllers/messageController");
const { isLoggedIn } = require("../middleware/authMiddleware");

router.get("/team/:teamId", isLoggedIn, getTeamMessages);
router.delete("/:id/delete-for-me", isLoggedIn, deleteForMe);
router.delete("/:id/delete-for-everyone", isLoggedIn, deleteForEveryone);

module.exports = router;
