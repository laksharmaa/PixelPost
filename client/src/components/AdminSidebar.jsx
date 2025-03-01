// components/AdminSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { motion } from "framer-motion";
import { FaHome, FaTrophy, FaSignOutAlt, FaPlus } from "react-icons/fa";

const AdminSidebar = () => {
  const { admin, logout } = useAdmin();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6"
    >
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-2">
          {admin?.name?.charAt(0) || "A"}
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {admin?.name}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {admin?.role}
        </p>
      </div>

      <nav className="space-y-2">
        <Link to="/admin/dashboard">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center p-3 rounded-lg ${
              isActive("/admin/dashboard")
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <FaHome className="mr-3" />
            <span>Dashboard</span>
          </motion.div>
        </Link>

        <Link to="/admin/contests">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center p-3 rounded-lg ${
              isActive("/admin/contests")
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <FaTrophy className="mr-3" />
            <span>Contests</span>
          </motion.div>
        </Link>

        <Link to="/admin/contests/create">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center p-3 rounded-lg ${
              isActive("/admin/contests/create")
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <FaPlus className="mr-3" />
            <span>Create Contest</span>
          </motion.div>
        </Link>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <FaSignOutAlt className="mr-3" />
          <span>Logout</span>
        </motion.div>
      </nav>
    </motion.div>
  );
};

export default AdminSidebar;
