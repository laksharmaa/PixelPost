// Pages/Admin/AdminCreateContest.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import AdminSidebar from "../../components/AdminSidebar";
import { motion } from "framer-motion";
import FormField from "../../components/FormField";
import Loader from "../../components/Loader";

const AdminCreateContest = () => {
  const { token } = useAdmin();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    theme: "",
    startDate: "",
    endDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear date error when either date changes
    if (name === "startDate" || name === "endDate") {
      setDateError("");
    }

    // Validate dates when both are present
    if (
      (name === "startDate" || name === "endDate") &&
      formData.startDate &&
      (name === "endDate" ? value : formData.endDate)
    ) {
      const start = new Date(name === "startDate" ? value : formData.startDate);
      const end = new Date(name === "endDate" ? value : formData.endDate);

      if (end <= start) {
        setDateError("End date must be greater than start date");
      }
    }
  };

  const validateDates = () => {
    if (!formData.startDate || !formData.endDate) return true;

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    return endDate > startDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateDates()) {
      setDateError("End date must be greater than start date");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/admin/contests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create contest");
      }

      navigate("/admin/contests");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <AdminSidebar />
      </div>

      <div className="md:col-span-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            Create New Contest
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <FormField
                  labelName="Contest Title"
                  type="text"
                  name="title"
                  placeholder="Enter contest title"
                  value={formData.title}
                  handleChange={handleChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    placeholder="Enter contest description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <FormField
                  labelName="Theme"
                  type="text"
                  name="theme"
                  placeholder="Enter contest theme"
                  value={formData.theme}
                  handleChange={handleChange}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    labelName="Start Date"
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    handleChange={handleChange}
                    required
                  />

                  <FormField
                    labelName="End Date"
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    handleChange={handleChange}
                    required
                  />
                </div>

                {dateError && (
                  <div className="col-span-2 mt-2 text-red-600 text-sm">
                    {dateError}
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => navigate("/admin/contests")}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isLoading || dateError}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md disabled:opacity-70"
                  >
                    {isLoading ? <Loader /> : "Create Contest"}
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCreateContest;
