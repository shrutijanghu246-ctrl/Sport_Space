const Post = require("../models/Post");

//create post or log
const createPost = async (req, res) => {
  try {
    const { type, content, isPublic, logDetails } = req.body;

    //if type is log, make sure it's never public
    const postIsPublic = type === "log" ? false : isPublic;

    const post = await Post.create({
      author: req.user._id, //comes from isLoggedIn middleware
      team: req.user.team,
      type,
      content,
      isPublic: postIsPublic,
      logDetails: type === "log" ? logDetails : undefined,
    });

    await post.populate("author", "name profilePic sport");

    res.status(201).json({ message: "Post created successfully", post });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//get team feed (members only - shows both posts and logs)
const getTeamFeed = async (req, res) => {
  try {
    const posts = await Post.find({ team: req.params.teamId })
      .populate("author", "name profilePic sport")
      .populate("comments.author", "name profilePic")
      .sort({ createdAt: -1 }); //newest first

    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//get public feed(no login needed - only public posts, no logs)
const getPublicFeed = async (req, res) => {
  try {
    const posts = await Post.find({ isPublic: true, type: "post" })
      .populate("author", "name sport profilePic")
      .sort({ createdAt: -1 })
      .limit(20); //only latest 20 shows

    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//like / unlike post
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      //unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      //like
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json({
      message: alreadyLiked ? "Unliked" : "Liked",
      likes: post.likes.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//add comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      author: req.user._id,
      text,
    });

    await post.save();
    await post.populate("comments.author", "name profilePic");

    res.status(201).json({ message: "Comment added", comments: post.comments });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//delete post (only author r=or captain/admin){
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isPrivileged = ["captain", "admin"].includes(req.user.role);

    if (!isAuthor && !isPrivileged) {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createPost,
  getTeamFeed,
  getPublicFeed,
  toggleLike,
  addComment,
  deletePost,
};
