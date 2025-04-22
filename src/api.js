import axios from "axios"

const API_URL = "http://localhost:5000/api"

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Auth API calls
export const register = async (username, email, password) => {
  try {
    const response = await api.post("/auth/register", { username, email, password })
    return response.data
  } catch (error) {
    console.error("Error registering user:", error)
    throw error.response?.data || { message: "Registration failed" }
  }
}

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password })
    return response.data
  } catch (error) {
    console.error("Error logging in:", error)
    throw error.response?.data || { message: "Login failed" }
  }
}

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/user")
    return response.data
  } catch (error) {
    console.error("Error fetching current user:", error)
    throw error.response?.data || { message: "Failed to fetch user data" }
  }
}

// Also keep getUserProfile as an alias for getCurrentUser for backward compatibility
export const getUserProfile = getCurrentUser

// Expense API calls
export const fetchExpenses = async () => {
  try {
    const response = await api.get("/expenses")
    return response.data || []
  } catch (error) {
    console.error("Error fetching expenses:", error)
    throw new Error("Failed to fetch expenses")
  }
}

export const addExpense = async (expenseData) => {
  try {
    const response = await api.post("/expenses", expenseData)
    return response.data
  } catch (error) {
    console.error("Error adding expense:", error)
    throw error.response?.data || { message: "Failed to add expense" }
  }
}

export const updateExpense = async (id, expenseData) => {
  try {
    const response = await api.put(`/expenses/${id}`, expenseData)
    return response.data
  } catch (error) {
    console.error("Error updating expense:", error)
    throw error.response?.data || { message: "Failed to update expense" }
  }
}

export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`/expenses/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting expense:", error)
    throw error.response?.data || { message: "Failed to delete expense" }
  }
}

// Category API calls
export const fetchCategories = async () => {
  try {
    const response = await api.get("/categories")
    return response.data || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw new Error("Failed to fetch categories")
  }
}

export const addCategory = async (name) => {
  try {
    const response = await api.post("/categories", { name })
    return response.data
  } catch (error) {
    console.error("Error adding category:", error)
    throw error.response?.data || { message: "Failed to add category" }
  }
}

export const updateCategory = async (id, name) => {
  try {
    const response = await api.put(`/categories/${id}`, { name })
    return response.data
  } catch (error) {
    console.error("Error updating category:", error)
    throw error.response?.data || { message: "Failed to update category" }
  }
}

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error.response?.data || { message: "Failed to delete category" }
  }
}

// Budget API calls
export const fetchBudgets = async (month) => {
  try {
    const response = await api.get("/budgets", { params: { month } })
    return response.data || []
  } catch (error) {
    console.error("Error fetching budgets:", error)
    throw new Error("Failed to fetch budgets")
  }
}

export const setBudget = async (budgetData) => {
  try {
    const response = await api.post("/budgets", budgetData)
    return response.data
  } catch (error) {
    console.error("Error setting budget:", error)
    throw error.response?.data || { message: "Failed to set budget" }
  }
}

// Transaction API calls
export const fetchTransactions = async () => {
  try {
    const response = await api.get("/transactions")
    return response.data || []
  } catch (error) {
    console.error("Error fetching transactions:", error)
    throw new Error("Failed to fetch transactions")
  }
}

export const addTransaction = async (transactionData) => {
  try {
    const response = await api.post("/transactions", transactionData)
    return response.data
  } catch (error) {
    console.error("Error adding transaction:", error)
    throw error.response?.data || { message: "Failed to add transaction" }
  }
}

export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.put(`/transactions/${id}`, transactionData)
    return response.data
  } catch (error) {
    console.error("Error updating transaction:", error)
    throw error.response?.data || { message: "Failed to update transaction" }
  }
}

export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/transactions/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting transaction:", error)
    throw error.response?.data || { message: "Failed to delete transaction" }
  }
}

// Summary API calls
export const fetchMonthlySummary = async (month, year) => {
  try {
    const response = await api.get("/summary/monthly", { params: { month, year } })
    return response.data || []
  } catch (error) {
    console.error("Error fetching monthly summary:", error)
    throw new Error("Failed to fetch monthly summary")
  }
}

// Admin API calls
export const fetchUsers = async () => {
  try {
    const response = await api.get("/admin/users")
    return response.data
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error.response?.data || { message: "Failed to fetch users" }
  }
}

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/admin/users/${id}`, userData)
    return response.data
  } catch (error) {
    console.error("Error updating user:", error)
    throw error.response?.data || { message: "Failed to update user" }
  }
}

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error.response?.data || { message: "Failed to delete user" }
  }
}

// Database inspection API calls
export const fetchDatabaseTables = async () => {
  try {
    const response = await api.get("/admin/tables")
    return response.data
  } catch (error) {
    console.error("Error fetching tables:", error)
    throw error.response?.data || { message: "Failed to fetch tables" }
  }
}

export const fetchTableData = async (tableName) => {
  try {
    const response = await api.get(`/admin/tables/${tableName}`)
    return response.data
  } catch (error) {
    console.error("Error fetching table data:", error)
    throw error.response?.data || { message: "Failed to fetch table data" }
  }
}

export const executeQuery = async (query) => {
  try {
    const response = await api.post("/admin/query", { query })
    return response.data
  } catch (error) {
    console.error("Error executing query:", error)
    throw error.response?.data || { message: "Failed to execute query" }
  }
}

export default api
