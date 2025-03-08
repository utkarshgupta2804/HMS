'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  FiHome, FiCalendar, FiUser, FiFileText, 
  FiSettings, FiLogOut, FiMenu, FiX 
} from 'react-icons/fi';
import { GiBed } from 'react-icons/gi';  // Add this import
import Overview from './dashboard/Overview';
import Appointments from './dashboard/Appointments';
import MedicalRecords from './dashboard/MedicalRecords';
import Profile from './dashboard/Profile';
import Beds from './dashboard/Beds';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/dashboard', {
          withCredentials: true // Important: This ensures cookies are sent
        });
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Sign out failed');
      }

      // Clear any client-side state or local storage if needed
      router.push('/signin');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'appointments', label: 'Appointments', icon: FiCalendar },
    { id: 'profile', label: 'My Profile', icon: FiUser },
    { id: 'records', label: 'Medical Records', icon: FiFileText },
    // { id: 'beds', label: 'Beds Status', icon: GiBed },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview dashboardData={dashboardData} />;
      case 'appointments':
        return <Appointments />;
      case 'records':
        return <MedicalRecords />;
      case 'profile':
        return <Profile dashboardData={dashboardData} />;
      case 'beds':
        return <Beds />;
      default:
        return <div>Coming Soon</div>;
    }
  };
  console.log(dashboardData);
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.2]" />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className="fixed lg:sticky top-0 left-0 h-screen w-64 bg-white/70 backdrop-blur-xl border-r border-gray-100 z-30"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              HMS
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-600 hover:text-blue-600">
              <FiX className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="space-y-3">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <button 
          onClick={handleSignOut}
          className="absolute bottom-8 left-6 flex items-center space-x-3 text-gray-600 hover:text-red-600 transition-colors p-4 rounded-xl hover:bg-red-50 w-[calc(100%-48px)]"
        >
          <FiLogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-blue-600"
            >
              <FiMenu className="h-6 w-6" />
            </button>

            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center text-white font-medium">
                  {dashboardData?.fullname?.[0] || 'U'}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-gray-900">{dashboardData?.fullname || 'Loading...'}</p>
                  <p className="text-sm text-gray-600">Patient</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 relative z-10">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
              {error}
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
