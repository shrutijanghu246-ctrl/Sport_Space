const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const { isLoggedIn } = require("../middleware/authMiddleware");

router.get("/", isLoggedIn, getNotifications);
router.patch("/:id/read", isLoggedIn, markAsRead);
router.patch("/read-all", isLoggedIn, markAllAsRead);

module.exports = router;
