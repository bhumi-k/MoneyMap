import express from "express"
import { db, authenticateToken } from "../server.js"

const router = express.Router()

// Get all expenses for a user with category names
router.get("/", authenticateToken, (req, res) => {
  db.all(
    `SELECT e.*, c.name as category_name 
     FROM expenses e 
     LEFT JOIN categories c ON e.category_id = c.id 
     WHERE e.user_id = ? 
     ORDER BY e.date DESC`,
    [req.user.id],
    (err, expenses) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ message: "Error fetching expenses" })
      }
      res.json(expenses)
    },
  )
})

// Add a new expense
router.post("/", authenticateToken, (req, res) => {
  const { amount, category_id, description, date } = req.body

  if (!amount) {
    return res.status(400).json({ message: "Amount is required" })
  }

  const expenseDate = date || new Date().toISOString()

  db.run(
    "INSERT INTO expenses (user_id, category_id, amount, description, date) VALUES (?, ?, ?, ?, ?)",
    [req.user.id, category_id, amount, description, expenseDate],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ message: "Error creating expense" })
      }

      db.get(
        `SELECT e.*, c.name as category_name 
         FROM expenses e 
         LEFT JOIN categories c ON e.category_id = c.id 
         WHERE e.id = ?`,
        [this.lastID],
        (err, expense) => {
          if (err) {
            return res.status(500).json({ message: "Error fetching created expense" })
          }
          res.status(201).json(expense)
        },
      )
    },
  )
})

// Update an expense
router.put("/:id", authenticateToken, (req, res) => {
  const { amount, category_id, description, date } = req.body
  const { id } = req.params

  db.get("SELECT * FROM expenses WHERE id = ? AND user_id = ?", [id, req.user.id], (err, expense) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching expense" })
    }

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" })
    }

    const updatedAmount = amount !== undefined ? amount : expense.amount
    const updatedCategoryId = category_id !== undefined ? category_id : expense.category_id
    const updatedDescription = description !== undefined ? description : expense.description
    const updatedDate = date !== undefined ? date : expense.date

    db.run(
      "UPDATE expenses SET amount = ?, category_id = ?, description = ?, date = ? WHERE id = ? AND user_id = ?",
      [updatedAmount, updatedCategoryId, updatedDescription, updatedDate, id, req.user.id],
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Error updating expense" })
        }

        db.get(
          `SELECT e.*, c.name as category_name 
             FROM expenses e 
             LEFT JOIN categories c ON e.category_id = c.id 
             WHERE e.id = ?`,
          [id],
          (err, updatedExpense) => {
            if (err) {
              return res.status(500).json({ message: "Error fetching updated expense" })
            }
            res.json(updatedExpense)
          },
        )
      },
    )
  })
})

// Delete an expense
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params

  db.run("DELETE FROM expenses WHERE id = ? AND user_id = ?", [id, req.user.id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Error deleting expense" })
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Expense not found" })
    }

    res.json({ message: "Expense deleted" })
  })
})

export default router
