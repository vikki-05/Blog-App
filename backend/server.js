const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in .env");
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
