const express = require("express");
const router = express.Router();
const {
  createTeam,
  getAllTeam,
  getTeam,
  addMember,
  removeMember,
} = require("../controllers/teamController");
const { isLoggedIn, authorizeRoles } = require("../middleware/authMiddleware");

route.post("/", isLoggedIn, authorizeRoles("admin", createTeam));
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

module.exports = router;
