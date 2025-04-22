"use client"

import { useState, useEffect } from "react"
import {
  fetchUsers,
  deleteUser,
  fetchDatabaseTables,
  fetchTableData,
  executeQuery,
  addCategory,
  updateCategory,
  deleteCategory,
  fetchCategories, // Added import for fetchCategories
} from "../../api"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState([])
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState("")
  const [tableData, setTableData] = useState([])
  const [sqlQuery, setSqlQuery] = useState("")
  const [queryResult, setQueryResult] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState(null)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (activeTab === "users") {
      loadUsers()
    } else if (activeTab === "database") {
      loadTables()
    } else if (activeTab === "categories") {
      loadCategories()
    }
  }, [activeTab])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await fetchUsers()
      setUsers(data)
    } catch (error) {
      setError(error.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const loadTables = async () => {
    try {
      setLoading(true)
      const data = await fetchDatabaseTables()
      setTables(data)
    } catch (error) {
      setError(error.message || "Failed to load database tables")
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await fetchCategories()
      setCategories(data)
    } catch (error) {
      setError(error.message || "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const handleTableSelect = async (tableName) => {
    try {
      setLoading(true)
      setSelectedTable(tableName)
      const data = await fetchTableData(tableName)
      setTableData(data)
    } catch (error) {
      setError(error.message || "Failed to load table data")
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) return

    try {
      setLoading(true)
      const data = await executeQuery(sqlQuery)
      setQueryResult(data)
    } catch (error) {
      setError(error.message || "Failed to execute query")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return

    try {
      await deleteUser(userId)
      setUsers(users.filter((user) => user.id !== userId))
    } catch (error) {
      setError(error.message || "Failed to delete user")
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return

    try {
      setLoading(true)
      await addCategory(newCategory)
      setNewCategory("")
      loadCategories()
    } catch (error) {
      setError(error.message || "Failed to add category")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCategory = async (id, name) => {
    try {
      setLoading(true)
      await updateCategory(id, name)
      setEditingCategory(null)
      loadCategories()
    } catch (error) {
      setError(error.message || "Failed to update category")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return

    try {
      setLoading(true)
      await deleteCategory(id)
      loadCategories()
    } catch (error) {
      setError(error.message || "Failed to delete category")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === "users" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "categories" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            Categories
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "database" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("database")}
          >
            Database
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {activeTab === "users" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">ID</th>
                    <th className="py-2 px-4 border-b">Username</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Role</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="py-2 px-4 border-b">{user.id}</td>
                      <td className="py-2 px-4 border-b">{user.username}</td>
                      <td className="py-2 px-4 border-b">{user.email}</td>
                      <td className="py-2 px-4 border-b">{user.role}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
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
          )}
        </div>
      )}

      {activeTab === "categories" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Category Management</h2>

          <div className="mb-4">
            <div className="flex">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="border rounded py-2 px-3 mr-2"
              />
              <button
                onClick={handleAddCategory}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Category
              </button>
            </div>
          </div>

          {loading ? (
            <p>Loading categories...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">ID</th>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="py-2 px-4 border-b">{category.id}</td>
                      <td className="py-2 px-4 border-b">
                        {editingCategory === category.id ? (
                          <input
                            type="text"
                            defaultValue={category.name}
                            className="border rounded py-1 px-2"
                            onBlur={(e) => handleUpdateCategory(category.id, e.target.value)}
                            autoFocus
                          />
                        ) : (
                          category.name
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => setEditingCategory(category.id)}
                          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
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
          )}
        </div>
      )}

      {activeTab === "database" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Database Explorer</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-1">
              <h3 className="font-medium mb-2">Tables</h3>
              <div className="border rounded p-2 h-64 overflow-y-auto">
                {tables.map((table) => (
                  <div
                    key={table}
                    className={`cursor-pointer p-2 hover:bg-gray-100 ${selectedTable === table ? "bg-blue-100" : ""}`}
                    onClick={() => handleTableSelect(table)}
                  >
                    {table}
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              <h3 className="font-medium mb-2">Table Data</h3>
              <div className="border rounded p-2 h-64 overflow-auto">
                {selectedTable ? (
                  loading ? (
                    <p>Loading table data...</p>
                  ) : (
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          {tableData.length > 0 &&
                            Object.keys(tableData[0]).map((column) => (
                              <th key={column} className="py-2 px-4 border-b text-left">
                                {column}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((value, j) => (
                              <td key={j} className="py-2 px-4 border-b">
                                {value !== null ? value.toString() : "NULL"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : (
                  <p className="text-gray-500">Select a table to view data</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">SQL Query</h3>
            <div className="mb-2">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full border rounded p-2 h-32"
                placeholder="Enter SQL query (SELECT only)"
              ></textarea>
            </div>
            <button
              onClick={handleExecuteQuery}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Execute Query
            </button>
          </div>

          {queryResult.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Query Result</h3>
              <div className="border rounded p-2 overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      {Object.keys(queryResult[0]).map((column) => (
                        <th key={column} className="py-2 px-4 border-b text-left">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="py-2 px-4 border-b">
                            {value !== null ? value.toString() : "NULL"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
