import express from "express"
import { db, authenticateToken } from "../server.js"

const router = express.Router()

// Get all transactions for a user with category names
router.get("/", authenticateToken, (req, res) => {
  db.all(
    `SELECT t.*, 
     fc.name as from_category_name, 
     tc.name as to_category_name 
     FROM transactions t 
     LEFT JOIN categories fc ON t.from_category_id = fc.id 
     LEFT JOIN categories tc ON t.to_category_id = tc.id 
     WHERE t.user_id = ? 
     ORDER BY t.date DESC`,
    [req.user.id],
    (err, transactions) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ message: "Error fetching transactions" })
      }
      res.json(transactions)
    },
  )
})

// Add a new transaction
router.post("/", authenticateToken, (req, res) => {
  const { from_category_id, to_category_id, amount, description, date } = req.body

  if (!amount || !from_category_id || !to_category_id) {
    return res.status(400).json({ message: "From category, to category, and amount are required" })
  }

  if (from_category_id === to_category_id) {
    return res.status(400).json({ message: "From and to categories cannot be the same" })
  }

  const transactionDate = date || new Date().toISOString()

  db.run(
    "INSERT INTO transactions (user_id, from_category_id, to_category_id, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)",
    [req.user.id, from_category_id, to_category_id, amount, description, transactionDate],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ message: "Error creating transaction" })
      }

      db.get(
        `SELECT t.*, 
         fc.name as from_category_name, 
         tc.name as to_category_name 
         FROM transactions t 
         LEFT JOIN categories fc ON t.from_category_id = fc.id 
         LEFT JOIN categories tc ON t.to_category_id = tc.id 
         WHERE t.id = ?`,
        [this.lastID],
        (err, transaction) => {
          if (err) {
            return res.status(500).json({ message: "Error fetching created transaction" })
          }
          res.status(201).json(transaction)
        },
      )
    },
  )
})

// Delete a transaction
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params

  db.run("DELETE FROM transactions WHERE id = ? AND user_id = ?", [id, req.user.id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Error deleting transaction" })
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    res.json({ message: "Transaction deleted" })
  })
})

export default router
