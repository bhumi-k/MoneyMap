import { FaChartPie, FaDollarSign, FaArrowUp, FaArrowDown } from "react-icons/fa"

const ExpenseSummary = ({ expenses }) => {
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0)

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += Number.parseFloat(expense.amount)
    return acc
  }, {})

  // Sort categories by amount (descending)
  const sortedCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3) // Get top 3 categories

  // Calculate this month's expenses
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const thisMonthExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    .reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0)

  // Calculate last month's expenses
  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1)
  const lastMonth = lastMonthDate.getMonth()
  const lastMonthYear = lastMonthDate.getFullYear()

  const lastMonthExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear
    })
    .reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0)

  // Calculate month-over-month change
  const monthlyChange =
    lastMonthExpenses !== 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

  // Get color based on change (green for decrease, red for increase)
  const changeColor = monthlyChange <= 0 ? "text-green-600" : "text-red-600"
  const changeIcon = monthlyChange <= 0 ? <FaArrowDown className="mr-1" /> : <FaArrowUp className="mr-1" />

  // Get category colors
  const getCategoryColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500",
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <FaChartPie className="mr-2 text-blue-600" /> Expense Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Total Expenses</h3>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-blue-600 flex items-center">
              <FaDollarSign className="text-2xl" />
              {totalExpenses.toFixed(2)}
            </span>

            {lastMonthExpenses > 0 && (
              <span className={`ml-3 text-sm font-medium flex items-center ${changeColor}`}>
                {changeIcon}
                {Math.abs(monthlyChange).toFixed(1)}% from last month
              </span>
            )}
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>This Month</span>
              <span>${thisMonthExpenses.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(thisMonthExpenses / (thisMonthExpenses + lastMonthExpenses)) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-sm text-gray-600 mt-2 mb-1">
              <span>Last Month</span>
              <span>${lastMonthExpenses.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-500 h-2 rounded-full"
                style={{ width: `${(lastMonthExpenses / (thisMonthExpenses + lastMonthExpenses)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Top Spending Categories</h3>
          {sortedCategories.length > 0 ? (
            <div className="space-y-3">
              {sortedCategories.map(([category, amount], index) => {
                const percentage = (amount / totalExpenses) * 100
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{category}</span>
                      <span className="font-medium">
                        ${amount.toFixed(2)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${getCategoryColor(index)} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">No expenses recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExpenseSummary
