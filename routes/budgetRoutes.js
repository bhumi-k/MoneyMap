import express from "express"
import { db, authenticateToken } from "../server.js"

const router = express.Router()

// Get all budgets for a user with category names
router.get("/", authenticateToken, (req, res) => {
  const { start_date, end_date } = req.query

  let query = `
    SELECT b.*, c.name as category_name 
    FROM budgets b 
    LEFT JOIN categories c ON b.category_id = c.id 
    WHERE b.user_id = ?
  `
  const params = [req.user.id]

  if (start_date && end_date) {
    query += ` AND ((b.start_date <= ? AND b.end_date >= ?) OR (b.start_date <= ? AND b.end_date >= ?) OR (b.start_date >= ? AND b.end_date <= ?))`
    params.push(end_date, start_date, start_date, end_date, start_date, end_date)
  }

  query += " ORDER BY b.start_date DESC"

  db.all(query, params, (err, budgets) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ message: "Error fetching budgets" })
    }
    res.json(budgets)
  })
})

// Add a new budget
router.post("/", authenticateToken, (req, res) => {
  const { category_id, amount, start_date, end_date } = req.body

  if (!amount || !category_id) {
    return res.status(400).json({ message: "Category and amount are required" })
  }

  // Check if a budget already exists for this category and date range
  db.get(
    `SELECT * FROM budgets 
     WHERE user_id = ? AND category_id = ? 
     AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?) OR (start_date >= ? AND end_date <= ?))`,
    [req.user.id, category_id, end_date, start_date, start_date, end_date, start_date, end_date],
    (err, existingBudget) => {
      if (err) {
        return res.status(500).json({ message: "Error checking existing budgets" })
      }

      if (existingBudget) {
        // Update existing budget
        db.run(
          "UPDATE budgets SET amount = ?, start_date = ?, end_date = ? WHERE id = ?",
          [amount, start_date, end_date, existingBudget.id],
          (err) => {
            if (err) {
              return res.status(500).json({ message: "Error updating budget" })
            }

            db.get(
              `SELECT b.*, c.name as category_name 
               FROM budgets b 
               LEFT JOIN categories c ON b.category_id = c.id 
               WHERE b.id = ?`,
              [existingBudget.id],
              (err, budget) => {
                if (err) {
                  return res.status(500).json({ message: "Error fetching updated budget" })
                }
                res.json(budget)
              },
            )
          },
        )
      } else {
        // Create new budget
        db.run(
          "INSERT INTO budgets (user_id, category_id, amount, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
          [req.user.id, category_id, amount, start_date, end_date],
          function (err) {
            if (err) {
              return res.status(500).json({ message: "Error creating budget" })
            }

            db.get(
              `SELECT b.*, c.name as category_name 
               FROM budgets b 
               LEFT JOIN categories c ON b.category_id = c.id 
               WHERE b.id = ?`,
              [this.lastID],
              (err, budget) => {
                if (err) {
                  return res.status(500).json({ message: "Error fetching created budget" })
                }
                res.status(201).json(budget)
              },
            )
          },
        )
      }
    },
  )
})

// Delete a budget
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params

  db.run("DELETE FROM budgets WHERE id = ? AND user_id = ?", [id, req.user.id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Error deleting budget" })
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Budget not found" })
    }

    res.json({ message: "Budget deleted" })
  })
})

export default router
