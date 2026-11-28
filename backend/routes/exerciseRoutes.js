const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();
router.param("id", validateObjectId("id"));
const {
  addExercise,
  getTeamExercises,
  deleteExercise,
} = require("../controllers/exerciseController");
const { isLoggedIn, authorizeRoles } = require("../middleware/authMiddleware");

router.post(
  "/",
  isLoggedIn,
  authorizeRoles("captain", "coach", "admin", "vice_captain"),
  addExercise,
);
router.get("/", isLoggedIn, getTeamExercises);
router.delete(
  "/:id",
  isLoggedIn,
  authorizeRoles("captain", "coach", "admin", "vice_captain"),
  deleteExercise,
);

module.exports = router;
