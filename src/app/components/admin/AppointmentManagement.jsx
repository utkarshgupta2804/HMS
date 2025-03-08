'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiUserPlus, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/admin/appointments');
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors');
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    }
  };

  const handleStatusChange = async (appointmentId, newStatus, doctorId, datetime) => {
    try {
      await axios.put('/api/admin/appointments', {
        appointmentId,
        status: newStatus,
        doctorId,
        datetime
      });
      
      toast.success(`Appointment ${newStatus}`);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update appointment');
      console.error('Error:', error);
    }
  };

  const AppointmentModal = ({ appointment, onClose }) => {
    const [selectedDoctor, setSelectedDoctor] = useState(appointment.doctorId?._id || '');
    const [appointmentDate, setAppointmentDate] = useState(
      appointment.datetime ? new Date(appointment.datetime).toISOString().slice(0, 16) : ''
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!selectedDoctor || !appointmentDate) {
        toast.error('Please select both doctor and date/time');
        return;
      }
      handleStatusChange(appointment._id, 'scheduled', selectedDoctor, appointmentDate);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-md"
        >
          <h3 className="text-xl font-bold text-gray-100 mb-4">Schedule Appointment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Doctor</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full rounded-lg border-gray-200 p-3"
                required
              >
                <option value="">Choose a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name || 'Unnamed'} - {doctor.specialization || 'General'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full rounded-lg border-gray-200 p-3"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Schedule
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        Appointment Management
      </h2>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Symptoms</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      {appointment.patientId ? (
                        <>
                          <div className="text-sm font-medium text-gray-100">
                            {appointment.patientId.fullName || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {appointment.patientId.email || 'No Email'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Phone: {appointment.patientId.phone || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {appointment.patientId._id}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 italic bg-yellow-50 p-2 rounded">
                          ⚠️ Patient data unavailable - Please check database
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-100 capitalize">{appointment.type}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(appointment.timeSlot).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(appointment.timeSlot).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {appointment.symptoms && appointment.symptoms.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {appointment.symptoms.map((symptom, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No symptoms listed</span>
                        )}
                        {appointment.reason && (
                          <div className="mt-1 text-sm text-gray-600">
                            Reason: {appointment.reason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${appointment.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-100">
                        {appointment.doctorId ? `${appointment.doctorId.name}` : 'Not assigned'}
                      </div>
                      {appointment.doctorId && (
                        <div className="text-xs text-gray-400">
                          {appointment.doctorId.specialization}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {appointment?.status !== 'cancelled' && appointment?.status !== 'completed' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiCalendar className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                            {appointment?.status === 'approved' && (
                              <button
                                onClick={() => handleStatusChange(appointment._id, 'completed')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <FiCheck className="h-5 w-5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}