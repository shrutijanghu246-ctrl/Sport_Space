const express = require("express");
const router = express.Router();
const {
  createPost,
  getTeamFeed,
  getPublicFeed,
  toggleLike,
  addComment,
  deletePost,
  deleteComment,
} = require("../controllers/postController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
router.param("commentId", validateObjectId("commentId"));
router.param("id", validateObjectId("id"));
router.param("teamId", validateObjectId("teamId"));
router.get("/public", getPublicFeed); //no login required
router.post("/", isLoggedIn, createPost);
router.get("/team/:teamId", isLoggedIn, getTeamFeed);
router.post("/:id/like", isLoggedIn, toggleLike);
router.post("/:id/comment", isLoggedIn, addComment);
router.delete("/:id", isLoggedIn, deletePost);
router.delete("/:id/comment/:commentId", isLoggedIn, deleteComment);

module.exports = router;
