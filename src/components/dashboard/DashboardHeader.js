import { FaSignOutAlt, FaChartPie, FaMoneyBillWave, FaClipboardList, FaUserCog, FaExchangeAlt } from "react-icons/fa";

const DashboardHeader = ({ user, activeTab, setActiveTab, logout, isAdmin }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold flex items-center">
            <FaMoneyBillWave className="mr-2" /> MoneyMap
          </h1>
          <p className="text-blue-100 mt-1">Smart Expense Tracker</p>
        </div>

        <div className="flex items-center">
          <div className="mr-4 text-right">
            <p className="font-medium">Welcome, {user.username}</p>
            <p className="text-xs text-blue-200">{user.role === "admin" ? "Administrator" : "User"}</p>
          </div>
          <button
            onClick={logout}
            className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium flex items-center transition duration-200"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>

      <div className="mt-6">
        <nav className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-lg flex items-center transition duration-200 ${
              activeTab === "expenses"
                ? "bg-white text-blue-700 font-medium shadow-md"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
            onClick={() => setActiveTab("expenses")}
          >
            <FaClipboardList className="mr-2" /> Expenses
          </button>

          <button
            className={`px-4 py-2 rounded-lg flex items-center transition duration-200 ${
              activeTab === "reports"
                ? "bg-white text-blue-700 font-medium shadow-md"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
            onClick={() => setActiveTab("reports")}
          >
            <FaChartPie className="mr-2" /> Reports
          </button>

          <button
            className={`px-4 py-2 rounded-lg flex items-center transition duration-200 ${
              activeTab === "budgets"
                ? "bg-white text-blue-700 font-medium shadow-md"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
            onClick={() => setActiveTab("budgets")}
          >
            <FaMoneyBillWave className="mr-2" /> Budgets
          </button>

          <button
            className={`px-4 py-2 rounded-lg flex items-center transition duration-200 ${
              activeTab === "transactions"
                ? "bg-white text-blue-700 font-medium shadow-md"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            <FaExchangeAlt className="mr-2" /> Transfers
          </button>

          {isAdmin && (
            <button
              className={`px-4 py-2 rounded-lg flex items-center transition duration-200 ${
                activeTab === "admin"
                  ? "bg-white text-blue-700 font-medium shadow-md"
                  : "bg-blue-700 text-white hover:bg-blue-800"
              }`}
              onClick={() => setActiveTab("admin")}
            >
              <FaUserCog className="mr-2" /> Admin
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default DashboardHeader;