const express = require("express");
const router = express.Router();
const validateObjectId = require("../middleware/validateObjectId");
router.param("id", validateObjectId("id"));
router.param("teamId", validateObjectId("teamId"));
router.param("achievementId", validateObjectId("achievementId"));
const {
  createTeam,
  getAllTeams,
  getTeam,
  addMember,
  removeMember,
  leaveTeam,
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
router.post("/:id/leave", isLoggedIn, leaveTeam);

module.exports = router;
