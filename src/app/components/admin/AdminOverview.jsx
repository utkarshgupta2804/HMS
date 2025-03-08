'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiUserPlus, FiCalendar, FiClock, FiFileText } from 'react-icons/fi';
import axios from 'axios';

const AdminOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { title: 'Total Patients', value: dashboardData?.stats.totalPatients || 0, icon: FiUsers, color: 'blue' },
    { title: 'Total Doctors', value: dashboardData?.stats.totalDoctors || 0, icon: FiUserPlus, color: 'green' },
    { title: 'Appointments Today', value: dashboardData?.stats.appointmentsToday || 0, icon: FiCalendar, color: 'purple' },
    { title: 'Pending Requests', value: dashboardData?.stats.pendingRequests || 0, icon: FiClock, color: 'orange' },
    { title: 'Medical Records', value: dashboardData?.stats.totalMedicalRecords || 0, icon: FiFileText, color: 'yellow' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        Dashboard Overview
      </h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <div className="text-violet-400 mb-2">
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-400">{stat.title}</p>
            <h3 className="text-2xl font-bold text-gray-100 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-100 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {dashboardData?.recentActivity.map((activity, index) => (
            <div 
              key={activity.id}
              className="flex items-center justify-between p-4 hover:bg-gray-700/50 rounded-lg 
                        border border-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                  <FiCalendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-100">
                    Appointment: {activity.patient}
                  </p>
                  <p className="text-sm text-gray-400">
                    Doctor: {activity.doctor}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                activity.status === 'pending' 
                  ? 'bg-yellow-900/50 text-yellow-400'
                  : activity.status === 'approved'
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-violet-900/50 text-violet-400'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
