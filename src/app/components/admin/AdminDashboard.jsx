'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FiHome, FiUsers, FiCalendar, FiUserPlus, 
  FiLogOut, FiMenu, FiX, FiSettings,
  FiPackage, FiMonitor, FiFileText, FiPieChart 
} from 'react-icons/fi';
import { GiBed } from 'react-icons/gi'; // Using GiBed instead of FiBed which doesn't exist
import AdminOverview from './AdminOverview';
import DoctorManagement from './DoctorManagement';
import UserManagement from './UserManagement';
import AppointmentManagement from './AppointmentManagement';
import InventoryManagement from './InventoryManagement';
import BedManagement from './BedManagement';
import MedicalRecords from './MedicalRecords';
import Analytics from './Analytics';

const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/admin/signout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Use window.location for a hard redirect to clear all states
        window.location.href = '/admin/signin';
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'doctors', label: 'Manage Doctors', icon: FiUserPlus },
    { id: 'users', label: 'Manage Users', icon: FiUsers },
    { id: 'appointments', label: 'Appointments', icon: FiCalendar },
    { id: 'medical-records', label: 'Medical Records', icon: FiFileText }, // Add this line
    { id: 'inventory', label: 'Inventory', icon: FiPackage },
    { id: 'analytics', label: 'Analytics', icon: FiPieChart }, // Add this line
    { id: 'beds', label: 'Bed Management', icon: GiBed }, // Updated to use GiBed
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'doctors':
        return <DoctorManagement onModalStateChange={setIsModalOpen} />;
      case 'users':
        return <UserManagement onModalStateChange={setIsModalOpen} />;
      case 'appointments':
        return <AppointmentManagement onModalStateChange={setIsModalOpen} />;
      case 'medical-records':
        return <MedicalRecords onModalStateChange={setIsModalOpen} />;
      case 'inventory':
        return <InventoryManagement onModalStateChange={setIsModalOpen} />;
      case 'analytics':
        return <Analytics onModalStateChange={setIsModalOpen} />;
      case 'beds':
        return <BedManagement onModalStateChange={setIsModalOpen} />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex relative">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Sidebar - Updated height and padding to prevent overlap */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className="fixed lg:sticky top-0 left-0 h-screen w-64 bg-gray-800/50 backdrop-blur-xl border-r border-white/10 z-30 flex flex-col"
      >
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-300">
              <FiX className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="space-y-2 mb-6">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/20'
                    : 'text-gray-300 hover:bg-white/5 hover:text-violet-400'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sign Out Button - Now outside the scrollable area */}
        <div className="p-6 border-t border-white/10">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 text-gray-300 hover:text-red-400 
                     transition-colors p-3 rounded-xl hover:bg-red-900/20"
          >
            <FiLogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Update header z-index based on modal state */}
        <header className={`bg-gray-800/50 backdrop-blur-xl border-b border-white/10 sticky top-0 ${isModalOpen ? 'z-0' : 'z-20'}`}>
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-300 hover:text-violet-400"
            >
              <FiMenu className="h-6 w-6" />
            </button>

            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 
                               flex items-center justify-center text-white font-medium">
                  A
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-gray-100">Admin User</p>
                  <p className="text-sm text-gray-400">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Updated overflow handling */}
        <main className="flex-1 relative">
          <div className="absolute inset-0 overflow-auto p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
