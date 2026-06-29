const express = require("express");
const router = express.Router();
const {
  createPost,
  getTeamFeed,
  getPublicFeed,
  toggleLike,
  addComment,
  deletePost,
} = require("../controllers/postController");
const { isLoggedIn } = require("../middleware/authMiddleware");

router.get("/public", getPublicFeed); //no login required
router.post("/", isLoggedIn, createPost);
router.get("/team/:teamId", isLoggedIn, getTeamFeed);
router.post("/:id/like", isLoggedIn, toggleLike);
router.post("/:id/comment", isLoggedIn, addComment);
router.delete("/:id", isLoggedIn, deletePost);

module.exports = router;
