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
  authorizeRoles("admin", "captain", "vice_captain", "coach"),
  createTeamAndJoin,
); //captain creates team and joins automatically

// Generic routes AFTER specific routes
router.post(
  "/",
  isLoggedIn,
  authorizeRoles("admin", "captain", "vice_captain", "coach"),
  createTeam,
);
router.get("/", getAllTeams); //public
router.get("/:id", getTeam); //public
router.post(
  "/:id/add-member",
  isLoggedIn,
  authorizeRoles("captain", "admin", "vice_captain", "coach"),
  addMember,
);
router.delete(
  "/:id/remove-member",
  isLoggedIn,
  authorizeRoles("captain", "admin", "vice_captain", "coach"),
  removeMember,
);
router.post(
  "/:id/achievements",
  isLoggedIn,
  authorizeRoles("captain", "admin", "vice_captain", "coach"),
  addAchievement,
);
router.delete(
  "/:teamId/achievements/:achievementId",
  isLoggedIn,
  authorizeRoles("captain", "admin", "vice_captain", "coach"),
  deleteAchievement,
);

router.post("/:id/join", isLoggedIn, joinTeam);

module.exports = router;
