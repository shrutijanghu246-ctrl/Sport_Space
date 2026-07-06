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
  joinTeam,
} = require("../controllers/teamController");
const { isLoggedIn, authorizeRoles } = require("../middleware/authMiddleware");

// Specific routes BEFORE generic routes
router.post(
  "/create-and-join",
  isLoggedIn,
  authorizeRoles("admin", "captain", "vice_captain"),
  createTeamAndJoin,
); //captain creates team and joins automatically

// Generic routes AFTER specific routes
router.post(
  "/",
  isLoggedIn,
  authorizeRoles("admin", "captain", "vice_captain"),
  createTeam,
);
router.get("/", getAllTeams); //public
router.get("/:id", getTeam); //public
router.post(
  "/:id/add-member",
  isLoggedIn,
  authorizeRoles("captain", "admin", "vice_captain"),
  addMember,
);
router.delete(
  "/:id/remove-member",
  isLoggedIn,
  authorizeRoles("captain", "admin", "vice_captain"),
  removeMember,
);
router.post(
  "/:id/achievements",
  isLoggedIn,
  authorizeRoles("captain", "admin", "vice_captain"),
  addAchievement,
);
router.delete(
  "/:teamId/achievements/:achievementId",
  isLoggedIn,
  authorizeRoles("captain", "admin", "vice_captain"),
  deleteAchievement,
);

router.post("/:id/join", isLoggedIn, joinTeam);

module.exports = router;
