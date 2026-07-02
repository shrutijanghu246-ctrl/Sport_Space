const express = require("express");
const router = express.Router();
const {
  createDietLog,
  getMyDietLogs,
  getMemberDietLogs,
  deleteDietLog,
} = require("../controllers/dietController");
const { isLoggedIn, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", isLoggedIn, createDietLog);
router.get("/my", isLoggedIn, getMyDietLogs);
router.get(
  "/member/:athleteId",
  isLoggedIn,
  authorizeRoles("captain", "coach", "admin"),
  getMemberDietLogs,
);
router.delete("/:id", isLoggedIn, deleteDietLog);

module.exports = router;
