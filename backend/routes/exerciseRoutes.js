const express = require("express");
const router = express.Router();
const {
  addExercise,
  getTeamExercises,
  deleteExercise,
} = require("../controllers/exerciseController");
const { isLoggedIn, authorizeRoles } = require("../middleware/authMiddleware");

router.post(
  "/",
  isLoggedIn,
  authorizeRoles("captain", "coach", "admin"),
  addExercise,
);
router.get("/", isLoggedIn, getTeamExercises);
router.delete(
  "/:id",
  isLoggedIn,
  authorizeRoles("captain", "coach", "admin"),
  deleteExercise,
);

module.exports = router;
