import express from "express";
import { db } from "../server.js";

const router = express.Router();

// Monthly summary endpoint
router.get("/monthly", (req, res) => {
  const { month, year } = req.query;
  const userId = req.user?.id;

  if (!userId || !month || !year) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`;

  const summary = {
    totalExpenses: 0,
    totalTransactions: 0,
    budgets: [],
  };

  db.get(
    "SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?",
    [userId, startDate, endDate],
    (err, row) => {
      if (err) {
        console.error("Error fetching total expenses:", err);
        return res.status(500).json({ message: "Error fetching expenses" });
      }
      summary.totalExpenses = row?.total || 0;

      db.get(
        "SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND date BETWEEN ? AND ?",
        [userId, startDate, endDate],
        (err, row) => {
          if (err) {
            console.error("Error fetching total transactions:", err);
            return res.status(500).json({ message: "Error fetching transactions" });
          }
          summary.totalTransactions = row?.total || 0;

          db.all(
            "SELECT * FROM budgets WHERE user_id = ? AND start_date <= ? AND end_date >= ?",
            [userId, endDate, startDate],
            (err, rows) => {
              if (err) {
                console.error("Error fetching budgets:", err);
                return res.status(500).json({ message: "Error fetching budgets" });
              }

              summary.budgets = rows || [];
              res.json(summary);
            }
          );
        }
      );
    }
  );
});

export default router;
