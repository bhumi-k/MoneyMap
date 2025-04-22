"use client"

import { useState } from "react"
import { FaExchangeAlt, FaMoneyBillWave, FaCalendarAlt, FaAlignLeft } from "react-icons/fa"

const TransactionForm = ({ onTransactionAdded, categories }) => {
  const [fromCategory, setFromCategory] = useState("")
  const [fromCategoryId, setFromCategoryId] = useState("")
  const [toCategory, setToCategory] = useState("")
  const [toCategoryId, setToCategoryId] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      if (fromCategoryId === toCategoryId) {
        throw new Error("From and To categories cannot be the same")
      }

      await onTransactionAdded({
        from_category_id: fromCategoryId,
        to_category_id: toCategoryId,
        amount: Number.parseFloat(amount),
        description,
        date: new Date(date).toISOString(),
      })

      // Show success message
      setSuccess(true)

      // Reset form
      setFromCategory("")
      setFromCategoryId("")
      setToCategory("")
      setToCategoryId("")
      setAmount("")
      setDescription("")
      setDate(new Date().toISOString().split("T")[0])

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      setError(error.message || "Failed to add transaction. Please try again.")
      console.error("Error in TransactionForm:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <FaExchangeAlt className="mr-2 text-blue-600" /> Transfer Between Categories
      </h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4" role="alert">
          <p>Transaction added successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fromCategory">
              From Category
            </label>
            <select
              id="fromCategory"
              value={fromCategory}
              onChange={(e) => {
                const selectedIndex = e.target.selectedIndex
                if (selectedIndex > 0) {
                  // Skip the first "Select a category" option
                  const selectedCategory = categories[selectedIndex - 1]
                  setFromCategory(selectedCategory.name)
                  setFromCategoryId(selectedCategory.id)
                } else {
                  setFromCategory("")
                  setFromCategoryId("")
                }
              }}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="toCategory">
              To Category
            </label>
            <select
              id="toCategory"
              value={toCategory}
              onChange={(e) => {
                const selectedIndex = e.target.selectedIndex
                if (selectedIndex > 0) {
                  // Skip the first "Select a category" option
                  const selectedCategory = categories[selectedIndex - 1]
                  setToCategory(selectedCategory.name)
                  setToCategoryId(selectedCategory.id)
                } else {
                  setToCategory("")
                  setToCategoryId("")
                }
              }}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center" htmlFor="amount">
              <FaMoneyBillWave className="mr-2 text-blue-600" /> Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center" htmlFor="date">
              <FaCalendarAlt className="mr-2 text-blue-600" /> Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center" htmlFor="description">
              <FaAlignLeft className="mr-2 text-blue-600" /> Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <>
              <FaExchangeAlt className="mr-2" /> Add Transfer
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default TransactionForm