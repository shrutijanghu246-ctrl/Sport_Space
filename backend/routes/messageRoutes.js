const express = require("express");
const router = express.Router();
const { getTeamMessages } = require("../controllers/messageController");
const { isLoggedIn } = require("../middleware/authMiddleware");

router.get("/team/:teamId", isLoggedIn, getTeamMessages);

module.exports = router;
