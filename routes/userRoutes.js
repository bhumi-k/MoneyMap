import express from "express"
import { db } from "../server.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" })
  }

  try {
    // Check if user already exists
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error" })
      }

      if (user) {
        return res.status(400).json({ message: "User already exists" })
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Create user
      db.run(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        function (err) {
          if (err) {
            return res.status(500).json({ message: "Error creating user" })
          }

          const token = jwt.sign({ id: this.lastID, username, email }, process.env.JWT_SECRET || "your_jwt_secret", {
            expiresIn: "1d",
          })

          res.status(201).json({
            id: this.lastID,
            username,
            email,
            token,
          })
        },
      )
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" })
  }

  try {
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error" })
      }

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1d" },
      )

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        token,
      })
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get user profile
router.get("/profile", authenticateToken, (req, res) => {
  db.get("SELECT id, username, email, role FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Database error" })
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  })
})

export default router
