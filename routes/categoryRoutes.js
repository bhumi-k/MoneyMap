import express from "express";
import { db } from "../server.js";
import { authenticateToken } from "../middleware/authenticateToken.js"; // or your middleware path

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.all("SELECT * FROM categories WHERE user_id = ?", [userId], (err, rows) => {
    if (err) {
      console.error("Failed to fetch categories:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(rows);
  });
});

export default router;
