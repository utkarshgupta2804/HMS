'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiEye, FiX, FiCalendar, FiDollarSign, FiClock } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AddDoctorModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience: '',
    qualifications: [{ degree: '', institution: '', year: '' }],
    consultationFee: '',
    availability: [] // Start with empty availability
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const addSlot = (day) => {
    console.log('Adding slot for day:', day); // Debug log
    setFormData(prev => {
      const newAvailability = [...prev.availability];
      const existingDayIndex = newAvailability.findIndex(a => a.day === day);
      
      if (existingDayIndex >= 0) {
        // Day exists, add new slot
        newAvailability[existingDayIndex].slots.push({
          startTime: '09:00',
          endTime: '17:00'
        });
      } else {
        // Create new day entry
        newAvailability.push({
          day: day,
          slots: [{
            startTime: '09:00',
            endTime: '17:00'
          }]
        });
      }
      
      console.log('Updated availability:', newAvailability); // Debug log
      return { ...prev, availability: newAvailability };
    });
  };

  const removeSlot = (day, slotIndex) => {
    setFormData(prev => {
      const newAvailability = [...prev.availability];
      const dayIndex = newAvailability.findIndex(a => a.day === day);
      
      if (dayIndex >= 0) {
        newAvailability[dayIndex].slots.splice(slotIndex, 1);
        // Remove day if no slots left
        if (newAvailability[dayIndex].slots.length === 0) {
          newAvailability.splice(dayIndex, 1);
        }
      }
      
      return { ...prev, availability: newAvailability };
    });
  };

  const updateSlot = (day, slotIndex, field, value) => {
    setFormData(prev => {
      const newAvailability = [...prev.availability];
      const dayIndex = newAvailability.findIndex(a => a.day === day);
      
      if (dayIndex >= 0) {
        newAvailability[dayIndex].slots[slotIndex][field] = value;
      }
      
      return { ...prev, availability: newAvailability };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate availability
      if (formData.availability.length === 0) {
        toast.error('Please add at least one availability slot');
        return;
      }

      console.log('Submitting data:', formData);
      const response = await axios.post('/api/admin/doctors', formData);
      console.log('Response:', response.data);

      if (response.data.success) {
        toast.success('Doctor added successfully');
        onClose(true);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || 'Failed to add doctor');
    }
  };

  const addQualification = () => {
    setFormData({
      ...formData,
      qualifications: [...formData.qualifications, { degree: '', institution: '', year: '' }]
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-100">Add New Doctor</h3>
          <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-200">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 rounded-lg focus:ring-2 focus:ring-violet-500 bg-gray-900/50 border-white/10 px-3 py-2 text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                className="w-full p-2 rounded-lg focus:ring-2 focus:ring-violet-500 bg-gray-900/50 border-white/10 px-3 py-2 text-gray-100"
                required
              />
            </div>
          </div>

          {/* Updated Qualifications Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">Qualifications</label>
              <button
                type="button"
                onClick={addQualification}
                className="text-sm text-violet-400 hover:text-violet-300"
              >
                + Add More
              </button>
            </div>
            {formData.qualifications.map((qual, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-lg">
                <input
                  placeholder="Degree"
                  value={qual.degree}
                  onChange={(e) => {
                    const newQuals = [...formData.qualifications];
                    newQuals[index].degree = e.target.value;
                    setFormData({...formData, qualifications: newQuals});
                  }}
                  className="w-full p-2 rounded-lg bg-gray-900/50 border-white/10 px-3 py-2 text-gray-100 focus:ring-2 focus:ring-violet-500"
                />
                <input
                  placeholder="Institution"
                  value={qual.institution}
                  onChange={(e) => {
                    const newQuals = [...formData.qualifications];
                    newQuals[index].institution = e.target.value;
                    setFormData({...formData, qualifications: newQuals});
                  }}
                  className="w-full p-2 rounded-lg bg-gray-900/50 border-white/10 px-3 py-2 text-gray-100 focus:ring-2 focus:ring-violet-500"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Year"
                    value={qual.year}
                    onChange={(e) => {
                      const newQuals = [...formData.qualifications];
                      newQuals[index].year = e.target.value;
                      setFormData({...formData, qualifications: newQuals});
                    }}
                    className="w-full p-2 rounded-lg bg-gray-900/50 border-white/10 px-3 py-2 text-gray-100 focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newQuals = formData.qualifications.filter((_, i) => i !== index);
                      setFormData({...formData, qualifications: newQuals});
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Experience (years)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full p-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-900/50 border-white/10 px-3 py-2 text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Consultation Fee (₹)</label>
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                className="w-full p-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-900/50 border-white/10 px-3 py-2 text-gray-100"
                required
              />
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-100">Availability Schedule</h4>
            {days.map((day) => (
              <div key={day} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-100">{day}</h5>
                  <button
                    type="button"
                    onClick={() => addSlot(day)}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    + Add Time Slot
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.availability.find(a => a.day === day)?.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(day, slotIndex, 'startTime', e.target.value)}
                        className="border rounded p-2 bg-gray-900/50 border-white/10 px-3 py-2 text-gray-100"
                      />
                      <span className="text-gray-100">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlot(day, slotIndex, 'endTime', e.target.value)}
                        className="border rounded p-2 bg-gray-900/50 border-white/10 px-3 py-2 text-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlot(day, slotIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-lg hover:shadow-lg shadow-violet-500/20 transition-all border border-white/10"
            >
              Add Doctor
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function DoctorManagement({ onModalStateChange }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      console.log('Fetching doctors...');
      
      const response = await axios.get('/api/admin/doctors');
      console.log('Doctors data:', response.data);
      
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Fetch error details:', {
        message: error.message,
        response: error.response?.data
      });
      toast.error('Failed to fetch doctors: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;

    try {
      await axios.delete(`/api/admin/doctors/${doctorId}`);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to delete doctor');
    }
  };

  const handleCloseModal = (refresh = false) => {
    setShowAddModal(false);
    onModalStateChange?.(false);
    if (refresh) {
      fetchDoctors();
    }
  };

  const handleOpenModal = () => {
    setShowAddModal(true);
    onModalStateChange?.(true);
  };

  const DoctorDetailsModal = ({ doctor, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800/50 backdrop-blur-xl border-white/10 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-100">Doctor Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Name", value: doctor.name },
              { label: "Specialization", value: doctor.specialization },
              { label: "Experience", value: `${doctor.experience} years` },
              { label: "Consultation Fee", value: `₹${doctor.consultationFee}` }
            ].map((info, index) => (
              <div key={index} className="bg-gray-900/50 border-white/10 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-400 mb-1">{info.label}</label>
                <p className="text-gray-100">{info.value}</p>
              </div>
            ))}
          </div>

          {/* Qualifications */}
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-3">Qualifications</h4>
            <div className="grid grid-cols-1 gap-3">
              {doctor.qualifications?.map((qual, index) => (
                <div key={index} className="bg-gray-900/50 border-white/10 p-4 rounded-lg">
                  <p className="font-medium text-gray-100">{qual.degree}</p>
                  <p className="text-gray-400 mt-1">
                    {qual.institution} • {qual.year}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Schedule */}
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-3">Weekly Availability</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctor.availability?.map((schedule, index) => (
                <div key={index} className="bg-gray-900/50 border-white/10 p-4 rounded-lg">
                  <p className="font-medium text-gray-100 mb-2">{schedule.day}</p>
                  <div className="space-y-2">
                    {schedule.slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center bg-gray-800/50 px-3 py-2 rounded text-gray-300">
                        <FiClock className="mr-2 h-4 w-4 text-violet-400" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ratings Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-3">Ratings & Reviews</h4>
            <div className="bg-gray-900/50 border-white/10 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-gray-100">
                  {doctor.averageRating?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-yellow-500 ml-2 text-2xl">⭐</span>
                <span className="text-gray-400 ml-2">
                  ({doctor.ratings?.length || 0} reviews)
                </span>
              </div>
              <div className="space-y-3">
                {doctor.ratings?.map((rating, index) => (
                  <div key={index} className="bg-gray-800/50 p-3 rounded border border-white/5">
                    <div className="flex items-center mb-1">
                      <div className="text-yellow-500">{'⭐'.repeat(rating.rating)}</div>
                      <span className="text-gray-400 text-sm ml-2">
                        {new Date(rating.date).toLocaleDateString()}
                      </span>
                    </div>
                    {rating.review && (
                      <p className="text-gray-300 text-sm">{rating.review}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const DoctorCard = ({ doctor }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-gray-700/50 transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-gray-100">{doctor.name}</h3>
          <p className="text-sm text-gray-400">{doctor.specialization}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedDoctor(doctor);
              setShowModal(true);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <FiEye className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(doctor._id)}
            className="text-red-600 hover:text-red-800"
          >
            <FiTrash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-400">
          <FiCalendar className="mr-2 text-violet-400" />
          <span>{doctor.experience} years experience</span>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <FiDollarSign className="mr-2 text-green-600" />
          <span>₹{doctor.consultationFee} consultation fee</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl bg-gradient-to-r font-bold from-violet-400 to-cyan-400 bg-clip-text text-transparent">Doctor Management</h2>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add Doctor</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      )}

      {showAddModal && <AddDoctorModal onClose={handleCloseModal} />}
      {showModal && selectedDoctor && (
        <DoctorDetailsModal
          doctor={selectedDoctor}
          onClose={() => {
            setShowModal(false);
            setSelectedDoctor(null);
          }}
        />
      )}
    </div>
  );
}
