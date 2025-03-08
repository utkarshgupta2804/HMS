'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { GiBed } from 'react-icons/gi'; // Using GiBed instead of FiBed

const BedManagement = () => {
  const [beds, setBeds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Initialize updateData with null values instead of 0
  const [updateData, setUpdateData] = useState({
    bedsInUse: null,
    totalBeds: null
  });

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const response = await fetch('/api/admin/beds');
      const data = await response.json();
      setBeds(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bed data');
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      console.log('Updating beds...', updateData); // Debug log
      const newBedsInUse = parseInt(updateData.bedsInUse);
      const newTotalBeds = parseInt(updateData.totalBeds) || beds.totalBeds;
      
      if (isNaN(newBedsInUse) || newBedsInUse < 0 || newBedsInUse > newTotalBeds) {
        alert('Please enter valid bed numbers');
        return;
      }

      const requestBody = {
        bedsInUse: newBedsInUse,
        totalBeds: newTotalBeds
      };

      console.log('Request body:', requestBody); // Debug log

      const response = await fetch('/api/admin/beds', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update beds');
      }

      const updatedBeds = await response.json();
      console.log('Updated beds:', updatedBeds); // Debug log
      
      setBeds(updatedBeds);
      setIsModalOpen(false);
      setUpdateData({ bedsInUse: 0, totalBeds: 0 });
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update beds: ' + error.message);
    }
  };

  // Update this section to initialize the form with current values when opened
  const handleOpenModal = () => {
    setUpdateData({
      bedsInUse: beds?.bedsInUse || 0,
      totalBeds: beds?.totalBeds || 0
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        Bed Management
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Beds', value: beds?.totalBeds, color: 'violet' },
          { label: 'Available Beds', value: beds?.availableBeds, color: 'emerald' },
          { label: 'Beds In Use', value: beds?.bedsInUse, color: 'rose' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-white/10 p-6 rounded-xl"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 bg-${stat.color}-500/20 rounded-lg`}>
                <GiBed className={`h-6 w-6 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-gray-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-100">{stat.value || 0}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Update Button */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenModal}
          className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-6 py-2 rounded-xl
                     hover:shadow-lg shadow-violet-500/20 transition-all border border-white/10
                     flex items-center space-x-2"
        >
          <FiEdit2 className="h-4 w-4" />
          <span>Update Bed Status</span>
        </button>
      </div>

      {/* Status Overview */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 p-6 rounded-xl">
        <h2 className="text-xl font-bold text-gray-100 mb-4">Bed Status Overview</h2>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                Occupancy Rate
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-purple-600">
                {beds?.totalBeds ? ((beds.bedsInUse / beds.totalBeds) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
            <div
              style={{ width: `${beds?.totalBeds ? ((beds.bedsInUse / beds.totalBeds) * 100) : 0}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600 transition-all duration-500"
            ></div>
          </div>
        </div>
      </div>

      {/* Modal with dark theme */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-xl border border-white/10 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-100">Update Bed Status</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <FiX className="h-6 w-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Total Beds
                </label>
                <input
                  type="number"
                  value={updateData.totalBeds || beds?.totalBeds || 0}
                  onChange={(e) => setUpdateData(prev => ({ 
                    ...prev, 
                    totalBeds: parseInt(e.target.value) || 0 
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Beds In Use (max: {updateData.totalBeds || beds?.totalBeds})
                </label>
                <input
                  type="number"
                  value={updateData.bedsInUse}
                  onChange={(e) => setUpdateData(prev => ({ 
                    ...prev,
                    bedsInUse: parseInt(e.target.value) || 0 
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  min="0"
                  max={updateData.totalBeds || beds?.totalBeds}
                />
              </div>

              <div className="pt-2">
                <p className="text-sm text-gray-400">
                  Available Beds: {(updateData.totalBeds || beds?.totalBeds) - updateData.bedsInUse}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BedManagement;
