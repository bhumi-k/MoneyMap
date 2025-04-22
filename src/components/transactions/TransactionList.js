"use client"

import { useState, useEffect } from "react"
import { fetchTransactions, deleteTransaction } from "../../api"

const TransactionList = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await fetchTransactions()
      setTransactions(data)
    } catch (error) {
      setError("Failed to load transactions")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id)
      setTransactions(transactions.filter((transaction) => transaction.id !== id))
    } catch (error) {
      setError("Failed to delete transaction")
      console.error(error)
    }
  }

  if (loading) return <div className="text-center py-4">Loading transactions...</div>

  if (error) return <div className="text-red-500 text-center py-4">{error}</div>

  if (transactions.length === 0) {
    return <div className="text-center py-4 text-gray-500">No transactions found</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="py-2 px-4 border-b">{new Date(transaction.date).toLocaleDateString()}</td>
              <td className="py-2 px-4 border-b">{transaction.description}</td>
              <td className="py-2 px-4 border-b">${transaction.amount.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{transaction.type}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionList
