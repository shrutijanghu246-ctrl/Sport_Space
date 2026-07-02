const express = require("express");
const router = express.Router();
const {
  searchFoods,
  getAllFoods,
  addFood,
} = require("../controllers/foodController");
const { isLoggedIn, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/search", isLoggedIn, searchFoods);
router.get("/", isLoggedIn, getAllFoods);
router.post(
  "/",
  isLoggedIn,
  authorizeRoles("admin", "coach", "captain"),
  addFood,
);

module.exports = router;
