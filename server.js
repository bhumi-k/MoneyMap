import express from "express"
import sqlite3 from "sqlite3"
import cors from "cors"
import path from "path"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import fs from "fs"
import { fileURLToPath } from "url"
// server.js (top of file)
import { authenticateToken } from "./middleware/auth.js";

// Routes
import userRoutes from "./routes/userRoutes.js"
import expenseRoutes from "./routes/expenseRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import transactionRoutes from "./routes/transactionRoutes.js"
import budgetRoutes from "./routes/budgetRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import summaryRoutes from "./routes/summaryRoutes.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Initialize SQLite database
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, "database.sqlite")

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Initialize database connection
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to SQLite database:", err)
  } else {
    console.log("Connected to SQLite database")
    initializeDatabase()
  }
})

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)

  // Expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      amount REAL NOT NULL,
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `)

  // Budgets table
  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      amount REAL NOT NULL,
      start_date DATETIME,
      end_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `)

  // Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      from_category_id INTEGER,
      to_category_id INTEGER,
      amount REAL NOT NULL,
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (from_category_id) REFERENCES categories (id),
      FOREIGN KEY (to_category_id) REFERENCES categories (id)
    )
  `)

  // Create default admin user if not exists
  db.get("SELECT * FROM users WHERE email = ?", ["admin@moneymap.com"], (err, user) => {
    if (err) {
      console.error("Error checking for admin user:", err)
    } else if (!user) {
      // Create admin user
      db.run(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        ["Admin", "admin@moneymap.com", "$2b$10$XdUzLtWTjYiQcKiS3XVqAOC6qdJF8ZKhGdNiLCKmG6SZffZYyX3Oa", "admin"],
        function (err) {
          if (err) {
            console.error("Error creating admin user:", err)
          } else {
            console.log("Admin user created with ID:", this.lastID)

            // Create default categories for admin
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
              db.run("INSERT INTO categories (user_id, name) VALUES (?, ?)", [this.lastID, category], (err) => {
                if (err) console.error(`Error creating category ${category}:`, err)
              })
            })
          }
        },
      )
    }
  })
}



// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/budgets", budgetRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/summary", summaryRoutes)
app.use("/api/admin", adminRoutes)

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
