// Pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import AdminSidebar from '../../components/AdminSidebar';
import { motion } from 'framer-motion';
import { FaTrophy, FaCalendarAlt, FaCheckCircle, FaClock, FaPlus } from 'react-icons/fa';
import Loader from '../../components/Loader';

const AdminDashboard = () => {
  const { token } = useAdmin();
  const [stats, setStats] = useState({
    totalContests: 0,
    activeContests: 0,
    upcomingContests: 0,
    completedContests: 0,
  });
  const [recentContests, setRecentContests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/admin/contests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch contests');
        }

        const { data } = await response.json();
        
        // Calculate stats
        const active = data.filter(contest => contest.status === 'active').length;
        const upcoming = data.filter(contest => contest.status === 'upcoming').length;
        const completed = data.filter(contest => contest.status === 'completed').length;
        
        setStats({
          totalContests: data.length,
          activeContests: active,
          upcomingContests: upcoming,
          completedContests: completed,
        });
        
        // Get 5 most recent contests
        setRecentContests(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'upcoming':
        return 'text-blue-500';
      case 'completed':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
                  <FaTrophy className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Contests</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalContests}</h3>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
                  <FaCheckCircle className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Contests</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.activeContests}</h3>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
                  <FaClock className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Contests</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.upcomingContests}</h3>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-4">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed Contests</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.completedContests}</h3>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Recent Contests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Contests</h2>
              <Link to="/admin/contests">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  View All
                </motion.button>
              </Link>
            </div>
            
            {recentContests.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No contests found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Theme</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {recentContests.map((contest) => (
                      <tr key={contest._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/admin/contests/${contest._id}`} className="text-purple-600 dark:text-purple-400 hover:underline">
                            {contest.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{contest.theme}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatDate(contest.startDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatDate(contest.endDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`capitalize ${getStatusColor(contest.status)}`}>
                            {contest.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/admin/contests/create">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg p-4 flex items-center justify-center shadow-md"
                >
                  <FaPlus className="mr-2" />
                  <span>Create New Contest</span>
                </motion.div>
              </Link>
              <Link to="/admin/contests">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg p-4 flex items-center justify-center shadow-md"
                >
                  <FaTrophy className="mr-2" />
                  <span>Manage Contests</span>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;