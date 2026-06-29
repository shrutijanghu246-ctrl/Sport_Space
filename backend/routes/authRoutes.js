const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const { isLoggedIn } = require("../middleware/authMiddleware");

router.get("/me", isLoggedIn, (req, res) => {
  res.status(200).json({ user: req.user });
});

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
