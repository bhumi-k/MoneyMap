"use client"

import { useState } from "react"
import { deleteExpense } from "../../api"
import { FaSearch, FaFilter, FaTrash, FaCalendarAlt, FaTag, FaAlignLeft, FaDollarSign } from "react-icons/fa"

const ExpenseList = ({ expenses, onExpenseUpdated }) => {
  const [filter, setFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleDelete = async (id) => {
    setConfirmDelete(id)
  }

  const confirmDeleteExpense = async (id) => {
    try {
      await deleteExpense(id)
      if (onExpenseUpdated) {
        onExpenseUpdated()
      }
      setConfirmDelete(null)
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const cancelDelete = () => {
    setConfirmDelete(null)
  }

  // Get unique categories from expenses
  const categories = [...new Set(expenses.map((expense) => expense.category))]

  // Filter expenses based on search term and category
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      filter === "" ||
      expense.description?.toLowerCase().includes(filter.toLowerCase()) ||
      expense.category.toLowerCase().includes(filter.toLowerCase())

    const matchesCategory = categoryFilter === "" || expense.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
    } else if (sortBy === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount
    } else if (sortBy === "category") {
      return sortOrder === "asc" ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category)
    }
    return 0
  })

  const toggleSortOrder = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Expense History</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search expenses..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:w-64 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaFilter className="text-gray-400" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaSearch className="mx-auto text-gray-400 text-4xl mb-3" />
          <p className="text-gray-500 text-lg">No expenses found.</p>
          <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSortOrder("date")}
                >
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    Date
                    {sortBy === "date" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSortOrder("category")}
                >
                  <div className="flex items-center">
                    <FaTag className="mr-1" />
                    Category
                    {sortBy === "category" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaAlignLeft className="mr-1" />
                    Description
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSortOrder("amount")}
                >
                  <div className="flex items-center">
                    <FaDollarSign className="mr-1" />
                    Amount
                    {sortBy === "amount" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{expense.description || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Number.parseFloat(expense.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {confirmDelete === expense.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => confirmDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Confirm
                        </button>
                        <button onClick={cancelDelete} className="text-gray-600 hover:text-gray-900">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 text-right">
        Showing {filteredExpenses.length} of {expenses.length} expenses
      </div>
    </div>
  )
}

export default ExpenseList
