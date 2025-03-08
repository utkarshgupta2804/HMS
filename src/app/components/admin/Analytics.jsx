'use client';
import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { motion } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState({
    monthly: [],
    topItems: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get('/api/admin/analytics/inventory');
      setSalesData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthlySalesConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Sales Trend',
        color: '#fff'
      }
    },
    scales: {
      y: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  const monthlySalesData = {
    labels: salesData.monthly.map(item => item.month),
    datasets: [
      {
        label: 'Sales Amount (₹)',
        data: salesData.monthly.map(item => item.total),
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.5)',
        tension: 0.4
      }
    ]
  };

  const topItemsData = {
    labels: salesData.topItems.map(item => item.name),
    datasets: [
      {
        label: 'Units Sold',
        data: salesData.topItems.map(item => item.soldQuantity),
        backgroundColor: 'rgba(124, 58, 237, 0.8)',
        borderColor: 'rgb(124, 58, 237)',
        borderWidth: 1
      },
      {
        label: 'Initial Stock',
        data: salesData.topItems.map(item => item.initialStock),
        backgroundColor: 'rgba(6, 182, 212, 0.8)',
        borderColor: 'rgb(6, 182, 212)',
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        Inventory Analytics
      </h2>

      <div className="grid grid-cols-1 gap-6">
        {/* Monthly Sales Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
        >
          <Line options={monthlySalesConfig} data={monthlySalesData} />
        </motion.div>

        {/* Top Selling Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Top Selling Items</h3>
            <div className="text-sm text-gray-400 space-y-1">
              {salesData.topItems.map(item => (
                <div key={item.name} className="flex justify-between gap-4">
                  <span>{item.name}:</span>
                  <span className="text-violet-400">
                    {item.soldQuantity} / {item.initialStock} units (₹{item.totalRevenue?.toFixed(2)})
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Bar
            data={topItemsData}
            options={{
              responsive: true,
              scales: {
                y: {
                  ticks: { color: '#fff' },
                  grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                  ticks: { color: '#fff' },
                  grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
              },
              plugins: {
                legend: {
                  labels: { color: '#fff' }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const item = salesData.topItems[context.dataIndex];
                      const label = context.dataset.label;
                      const value = context.raw;
                      
                      if (label === 'Units Sold') {
                        return `Sold: ${value} units (₹${item.totalRevenue?.toFixed(2)})`;
                      }
                      return `${label}: ${value} units`;
                    }
                  }
                }
              }
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
