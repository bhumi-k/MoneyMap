import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { db, authenticateToken } from "../server.js"

const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body

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

          const userId = this.lastID

          // Create default categories for the new user
          const categories = [
            "Housing",
            "Food",
            "Transportation",
            "Entertainment",
            "Utilities",
            "Healthcare",
            "Personal",
            "Education",
            "Savings",
            "Miscellaneous",
          ]
          categories.forEach((category) => {
            db.run("INSERT INTO categories (user_id, name) VALUES (?, ?)", [userId, category], (err) => {
              if (err) console.error(`Error creating category ${category}:`, err)
            })
          })

          // Generate token
          const token = jwt.sign(
            { id: userId, username, email, role: "user" },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "7d" },
          )

          res.status(201).json({
            token,
            user: {
              id: userId,
              username,
              email,
              role: "user",
            },
          })
        },
      )
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Login user
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
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

      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "7d" },
      )

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      })
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get current user
router.get("/user", authenticateToken, (req, res) => {
  res.json(req.user)
})

export default router
