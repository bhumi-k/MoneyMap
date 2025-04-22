import { useState, useEffect, useContext } from "react";
import DashboardHeader from "./DashboardHeader";
import ExpenseForm from "../expenses/ExpenseForm";
import ExpenseList from "../expenses/ExpenseList";
import ExpenseSummary from "../expenses/ExpenseSummary";
import ExpenseChart from "../charts/ExpenseChart";
import BudgetForm from "../budget/BudgetForm";
import AdminDashboard from "../admin/AdminDashboard";
import TransactionForm from "../transactions/TransactionForm";
import TransactionList from "../transactions/TransactionList";
import {
  fetchExpenses,
  fetchTransactions,
  fetchCategories,
  addExpense,
  setBudget,
  fetchMonthlySummary,
  fetchBudgets,
} from "../../api";
import { AuthContext } from "../../context/AuthContext";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [expensesData, transactionsData, categoriesData] = await Promise.all([
          fetchExpenses(),
          fetchTransactions(),
          fetchCategories(),
        ]);
        setExpenses(expensesData);
        setTransactions(transactionsData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshExpenses = async () => {
    try {
      const expensesData = await fetchExpenses();
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error refreshing expenses:", error);
    }
  };

  const refreshTransactions = async () => {
    try {
      const transactionsData = await fetchTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    }
  };

  const handleAddExpense = async (expense) => {
    try {
      await addExpense(expense);
      refreshExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleSetBudget = async (budget) => {
    try {
      await setBudget(budget);
      return true;
    } catch (error) {
      console.error("Error setting budget:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <DashboardHeader
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          logout={logout}
          isAdmin={isAdmin}
        />

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <svg
              className="animate-spin h-12 w-12 text-blue-600 mx-auto"
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
            <p className="text-gray-600 mt-4 text-lg">Loading your financial data...</p>
          </div>
        ) : (
          <>
            {activeTab === "expenses" && (
              <div>
                <ExpenseForm addExpense={handleAddExpense} onExpenseAdded={refreshExpenses} categories={categories} />
                <ExpenseSummary expenses={expenses} />
                <ExpenseList expenses={expenses} onExpenseUpdated={refreshExpenses} />
              </div>
            )}

            {activeTab === "reports" && (
              <div>
                <ExpenseChart expenses={expenses} />
              </div>
            )}

            {activeTab === "budgets" && (
              <div>
                <BudgetForm
                  fetchBudgets={fetchBudgets}
                  setBudget={handleSetBudget}
                  loadSummary={fetchMonthlySummary}
                  categories={categories}
                />
              </div>
            )}

            {activeTab === "transactions" && (
              <div>
                <TransactionForm onTransactionAdded={refreshTransactions} categories={categories} />
                <TransactionList transactions={transactions} onTransactionUpdated={refreshTransactions} />
              </div>
            )}

            {activeTab === "admin" && isAdmin && <AdminDashboard />}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
