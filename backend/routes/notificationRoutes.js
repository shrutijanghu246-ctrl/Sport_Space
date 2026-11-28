const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();
router.param("id", validateObjectId("id"));
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
