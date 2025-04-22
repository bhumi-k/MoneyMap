"use client"

import { useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"
import { Pie, Bar } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const ExpenseChart = ({ expenses }) => {
  const [chartType, setChartType] = useState("pie")

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += Number.parseFloat(expense.amount)
    return acc
  }, {})

  // Prepare data for charts
  const categories = Object.keys(expensesByCategory)
  const amounts = Object.values(expensesByCategory)

  // Generate random colors for chart
  const generateColors = (count) => {
    const colors = []
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 200)
      const g = Math.floor(Math.random() * 200)
      const b = Math.floor(Math.random() * 200)
      colors.push(`rgba(${r}, ${g}, ${b}, 0.6)`)
    }
    return colors
  }

  const backgroundColors = generateColors(categories.length)

  const pieChartData = {
    labels: categories,
    datasets: [
      {
        data: amounts,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  }

  const barChartData = {
    labels: categories,
    datasets: [
      {
        label: "Expenses by Category",
        data: amounts,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Expense Distribution by Category",
      },
    },
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Expense Analysis</h2>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded ${chartType === "pie" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setChartType("pie")}
          >
            Pie Chart
          </button>
          <button
            className={`px-3 py-1 rounded ${chartType === "bar" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setChartType("bar")}
          >
            Bar Chart
          </button>
        </div>
      </div>

      {expenses.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No expense data available for charts.</p>
      ) : (
        <div className="h-80">
          {chartType === "pie" ? (
            <Pie data={pieChartData} options={chartOptions} />
          ) : (
            <Bar data={barChartData} options={chartOptions} />
          )}
        </div>
      )}
    </div>
  )
}

export default ExpenseChart

