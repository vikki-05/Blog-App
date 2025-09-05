const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

// Get all posts (public) - newest first
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a post (protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Title and content required" });

    const newPost = new Post({ title, content, author: req.user.id });
    await newPost.save();

    // ✅ no execPopulate
    const populated = await newPost.populate("author", "username email");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username email");
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update (only author)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Title and content required" });

    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id },
      { title, content },
      { new: true }
    ).populate("author", "username email");

    if (!updatedPost)
      return res.status(403).json({ error: "Not authorized to update this post" });

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete (only author)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedPost = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id,
    });
    if (!deletedPost)
      return res.status(403).json({ error: "Not authorized to delete this post" });

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
