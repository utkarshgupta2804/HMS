'use client';
import React, { useState, useEffect } from 'react';
import { GiBed } from 'react-icons/gi';
import axios from 'axios';

const Beds = () => {
  const [bedStats, setBedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBedStats = async () => {
      try {
        const response = await axios.get('/api/beds');
        setBedStats(response.data);
      } catch (err) {
        setError('Failed to load bed statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchBedStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      <h2 className="text-2xl font-bold text-gray-800">Hospital Bed Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Beds Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-3">
            <GiBed className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-700">Total Beds</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{bedStats?.totalBeds || 0}</p>
        </div>

        {/* Available Beds Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-3">
            <GiBed className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-700">Available Beds</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{bedStats?.availableBeds || 0}</p>
        </div>

        {/* Beds in Use Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-3">
            <GiBed className="w-8 h-8 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-700">Beds in Use</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">{bedStats?.bedsInUse || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Beds;
