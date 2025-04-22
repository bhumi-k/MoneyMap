import express from "express"
import bcrypt from "bcrypt"
import { db, authenticateToken } from "../server.js"

const router = express.Router()

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin privileges required." })
  }
  next()
}

// Get all users (admin only)
router.get("/users", authenticateToken, isAdmin, (req, res) => {
  db.all("SELECT id, username, email, role, created_at FROM users", (err, users) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching users" })
    }
    res.json(users)
  })
})

// Update a user (admin only)
router.put("/users/:id", authenticateToken, isAdmin, async (req, res) => {
  const { username, email, password, role } = req.body
  const { id } = req.params

  // Check if user exists
  db.get("SELECT * FROM users WHERE id = ?", [id], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Database error" })
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Prepare update fields
    const updates = []
    const params = []

    if (username) {
      updates.push("username = ?")
      params.push(username)
    }

    if (email) {
      updates.push("email = ?")
      params.push(email)
    }

    if (password) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      updates.push("password = ?")
      params.push(hashedPassword)
    }

    if (role) {
      updates.push("role = ?")
      params.push(role)
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" })
    }

    // Add id to params
    params.push(id)

    // Update user
    db.run(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error updating user" })
      }

      db.get("SELECT id, username, email, role, created_at FROM users WHERE id = ?", [id], (err, updatedUser) => {
        if (err) {
          return res.status(500).json({ message: "Error fetching updated user" })
        }
        res.json(updatedUser)
      })
    })
  })
})

// Delete a user (admin only)
router.delete("/users/:id", authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params

  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Error deleting user" })
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User deleted" })
  })
})

// Get all database tables (admin only)
router.get("/tables", authenticateToken, isAdmin, (req, res) => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching tables" })
    }
    res.json(tables.map((table) => table.name))
  })
})

// Get data from a specific table (admin only)
router.get("/tables/:name", authenticateToken, isAdmin, (req, res) => {
  const { name } = req.params

  // Validate table name to prevent SQL injection
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [name], (err, table) => {
    if (err) {
      return res.status(500).json({ message: "Database error" })
    }

    if (!table) {
      return res.status(404).json({ message: "Table not found" })
    }

    db.all(`SELECT * FROM ${name} LIMIT 100`, (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching table data" })
      }
      res.json(data)
    })
  })
})

// Execute a custom SQL query (admin only, read-only)
router.post("/query", authenticateToken, isAdmin, (req, res) => {
  const { query } = req.body

  if (!query) {
    return res.status(400).json({ message: "Query is required" })
  }

  // Only allow SELECT queries for security
  if (!query.trim().toLowerCase().startsWith("select")) {
    return res.status(403).json({ message: "Only SELECT queries are allowed" })
  }

  db.all(query, (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error executing query", error: err.message })
    }
    res.json(data)
  })
})

export default router
