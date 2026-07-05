const express = require("express");
const router = express.Router();
const {
  createTeam,
  getAllTeams,
  getTeam,
  addMember,
  removeMember,
  addAchievement,
  deleteAchievement,
  createTeamAndJoin,
} = require("../controllers/teamController");
const { isLoggedIn, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", isLoggedIn, authorizeRoles("admin", "captain"), createTeam);
router.post(
  "/create-and-join",
  isLoggedIn,
  authorizeRoles("admin", "captain"),
  createTeamAndJoin,
); //captain creates team and joins automatically
router.get("/", getAllTeams); //public
router.get("/:id", getTeam); //public
router.post(
  "/:id/add-member",
  isLoggedIn,
  authorizeRoles("captain", "admin"),
  addMember,
);
router.delete(
  "/:id/remove-member",
  isLoggedIn,
  authorizeRoles("captain", "admin"),
  removeMember,
);
router.post(
  "/:id/achievements",
  isLoggedIn,
  authorizeRoles("captain", "admin"),
  addAchievement,
);
router.delete(
  "/:teamId/achievements/:achievementId",
  isLoggedIn,
  authorizeRoles("captain", "admin"),
  deleteAchievement,
);

module.exports = router;
