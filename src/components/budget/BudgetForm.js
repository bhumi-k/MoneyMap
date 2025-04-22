import { useState, useEffect } from "react";

const BudgetForm = ({ setBudget, fetchBudgets, loadSummary, categories = [] }) => {
  const [budgetData, setBudgetData] = useState({
    category_id: "",
    amount: "",
    start_date: "",
    end_date: "",
  });

  const handleChange = (e) => {
    setBudgetData({ ...budgetData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setBudget(budgetData);
      setBudgetData({ category_id: "", amount: "", start_date: "", end_date: "" });
    } catch (err) {
      console.error("Error setting budget", err);
    }
  };

  useEffect(() => {
    if (fetchBudgets) fetchBudgets();
    if (loadSummary) loadSummary();
  }, [fetchBudgets, loadSummary]);

  return (
    <div className="bg-white p-6 rounded shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Set Budget</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <select
          name="category_id"
          value={budgetData.category_id}
          onChange={handleChange}
          className="border rounded p-2"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={budgetData.amount}
          onChange={handleChange}
          className="border rounded p-2"
          required
        />

        <input
          type="date"
          name="start_date"
          value={budgetData.start_date}
          onChange={handleChange}
          className="border rounded p-2"
        />

        <input
          type="date"
          name="end_date"
          value={budgetData.end_date}
          onChange={handleChange}
          className="border rounded p-2"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded col-span-full hover:bg-blue-700"
        >
          Save Budget
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;
