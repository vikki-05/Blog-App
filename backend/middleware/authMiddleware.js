const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ msg: "No token, authorization denied" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ msg: "Invalid authorization format" });

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains { id: ... }
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
}

module.exports = authMiddleware;
