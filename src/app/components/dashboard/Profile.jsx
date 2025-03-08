'use client';
import React, { useState } from 'react';
import { FiEdit, FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';

const Profile = ({ dashboardData }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">My Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <FiEdit className="w-5 h-5" />
            <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="h-20 w-20 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center text-white">
              <FiUser className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{dashboardData.fullname}</h3>
              <p className="text-gray-600">Patient</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: FiMail, label: 'Email', value: dashboardData.email },
              { icon: FiPhone, label: 'Phone', value: dashboardData.phone || 'Not provided' }
            ].map((field, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <field.icon className="w-5 h-5" />
                  <span>{field.label}</span>
                </div>
                <input
                  type={field.label === 'Email' ? 'email' : 'text'}
                  value={field.value}
                  disabled={!isEditing}
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-100 text-gray-900 
                           focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Upcoming Appointments', value: dashboardData.upcomingAppointments },
                { label: 'Past Appointments', value: dashboardData.pastAppointments },
                { label: 'Medical Records', value: dashboardData.medicalRecords }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-gray-600">{stat.label}</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
