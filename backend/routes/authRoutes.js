const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  verifyOTP,
  resendOTP,
  getPublicProfile,
  addPersonalAchievement,
  deletePersonalAchievement,
} = require("../controllers/authController");
const { isLoggedIn } = require("../middleware/authMiddleware");

router.get("/me", isLoggedIn, (req, res) => {
  res.status(200).json({ user: req.user });
});

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/achievements", isLoggedIn, addPersonalAchievement);
router.delete("/achievements/:id", isLoggedIn, deletePersonalAchievement);
router.get("/profile/:userId", getPublicProfile);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

module.exports = router;
