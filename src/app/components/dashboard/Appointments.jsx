'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { checkAndUpdatePastAppointments } from '@/app/utils/checkAppointments';

const Appointments = () => {
  const [showBooking, setShowBooking] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const [formData, setFormData] = useState({
    doctorId: '',
    timeSlot: '',
    reason: '',
    type: 'regular',
    symptoms: [],
    notes: ''
  });

  useEffect(() => {
    console.log('Component mounted, fetching doctors...'); // Debug log
    fetchDoctors();
    fetchAppointments(activeTab);
  }, [activeTab]);

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors...'); // Debug log
      const response = await axios.get('/api/doctors');
      console.log('Doctors API response:', response.data); // Debug log

      if (Array.isArray(response.data)) {
        setDoctors(response.data);
        console.log('Doctors set in state:', response.data); // Debug log
      } else {
        console.error('Invalid doctors data format:', response.data);
        toast.error('Invalid doctors data received');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch doctors');
    }
  };

  const fetchAppointments = async (status) => {
    try {
      setLoading(true);
      console.log('Fetching appointments with status:', status);
      
      const response = await axios.get(`/api/appointments?status=${status}`, {
        withCredentials: true // Important for sending cookies
      });
      
      console.log('Raw response:', response);

      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log(`Fetched ${response.data.length} ${status} appointments`);
          setAppointments(response.data);
        } else {
          console.error('Invalid data format received:', response.data);
          setAppointments([]);
          toast.error('Invalid data format received');
        }
      } else {
        console.error('No data received');
        setAppointments([]);
        toast.error('No data received');
      }
    } catch (error) {
      console.error('Appointment fetch error:', error);
      console.error('Error details:', error.response?.data || error.message);
      setAppointments([]);
      toast.error(error.response?.data?.error || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchAppointments(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const checkAppointments = async () => {
      try {
        await checkAndUpdatePastAppointments();
        fetchAppointments(activeTab);
      } catch (error) {
        console.error('Error checking appointments:', error);
      }
    };

    // Check appointments when component mounts and every 5 minutes
    checkAppointments();
    const interval = setInterval(checkAppointments, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (submitData) => {
    try {
      if (!submitData.doctorId || !submitData.timeSlot || !submitData.reason) {
        toast.error('Please fill all required fields');
        return;
      }

      const response = await axios.post('/api/appointments', {
        ...submitData,
        timeSlot: new Date(submitData.timeSlot).toISOString(),
      }, {
        withCredentials: true // Important for sending cookies
      });

      toast.success('Appointment booked successfully');
      setShowBooking(false);
      fetchAppointments(activeTab);
      setFormData({ doctorId: '', timeSlot: '', reason: '', type: 'regular', symptoms: [], notes: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book appointment');
    }
  };

  const handleReasonChange = (e) => {
    e.preventDefault(); // Prevent form submission
    setFormData({
      ...formData,
      reason: e.target.value
    });
  };

  const handleCancel = async (appointmentId) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}`, {
        status: 'cancelled'
      });
      toast.success('Appointment cancelled successfully');
      fetchAppointments(activeTab);
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const BookingForm = () => {
    const [localFormData, setLocalFormData] = useState({
      doctorId: '',
      timeSlot: '',
      type: 'regular',
      reason: '',
      notes: '',
      symptoms: []
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Helper function to get next 7 days
    const getNext7Days = () => {
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    };

    const fetchAvailableSlots = async (doctorId, date) => {
      try {
        if (!doctorId || !date) return;
        setLoadingSlots(true);
        
        const response = await axios.get(`/api/doctors/${doctorId}/availability?date=${date}`);
        
        if (response.data.availableSlots) {
          setAvailableSlots(response.data.availableSlots);
          console.log('Fetched slots:', response.data);
        } else {
          setAvailableSlots([]);
          toast.info(response.data.message || 'No available slots found');
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        setAvailableSlots([]);
        toast.error('Failed to fetch available slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    const handleDoctorChange = (e) => {
      e.preventDefault();
      const newDoctorId = e.target.value;
      setLocalFormData(prev => ({
        ...prev,
        doctorId: newDoctorId,
        timeSlot: ''
      }));
      if (newDoctorId) {
        fetchAvailableSlots(newDoctorId, selectedDate);
      }
    };

    const handleDateChange = (e) => {
      const newDate = e.target.value;
      setSelectedDate(newDate);
      if (localFormData.doctorId) {
        fetchAvailableSlots(localFormData.doctorId, newDate);
      }
    };

    const handleSlotSelect = (slot) => {
      setLocalFormData(prev => ({
        ...prev,
        timeSlot: slot.startTime
      }));
    };

    const formatSlotTime = (dateTimeString) => {
      const date = new Date(dateTimeString);
      return {
        date: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      };
    };

    const handleSubmitForm = async (e) => {
      e.preventDefault();
      try {
        if (!localFormData.doctorId || !localFormData.timeSlot || !localFormData.reason) {
          toast.error('Please fill all required fields');
          return;
        }
  
        const response = await axios.post('/api/appointments', {
          ...localFormData,
          timeSlot: new Date(localFormData.timeSlot).toISOString(),
        }, {
          withCredentials: true
        });
  
        toast.success('Appointment booked successfully');
        setShowBooking(false);
        fetchAppointments(activeTab);
        setLocalFormData({
          doctorId: '',
          timeSlot: '',
          type: 'regular',
          reason: '',
          notes: '',
          symptoms: []
        });
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to book appointment');
      }
    };
  
    const handleKeyDown = (e) => {
      // Prevent form submission on Enter key for all inputs except the submit button
      if (e.key === 'Enter' && e.target.type !== 'submit') {
        e.preventDefault();
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-xl p-6 mb-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Book New Appointment</h3>
        <form onSubmit={handleSubmitForm} onKeyDown={handleKeyDown} className="space-y-6">
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Select Doctor</label>
            <select
              name="doctorId"
              value={localFormData.doctorId}
              onChange={handleDoctorChange}
              className="w-full rounded-lg bg-gray-50 border border-gray-100 p-3 text-gray-900"
              required
            >
              <option value="">Choose a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialization} (₹{doctor.consultationFee})
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          {localFormData.doctorId && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Select Date</label>
              <select
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full rounded-lg bg-gray-50 border border-gray-100 p-3 text-gray-900"
                required
              >
                {getNext7Days().map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Available Slots Grid */}
          {loadingSlots ? (
            <div className="text-center py-4 text-gray-500">Loading available slots...</div>
          ) : localFormData.doctorId && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-600">Available Slots</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot, index) => {
                    const { date, time } = formatSlotTime(slot.startTime);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-3 rounded-lg border text-left transition-colors
                          ${localFormData.timeSlot === slot.startTime
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-100 hover:border-blue-200 text-gray-600'
                          }`}
                      >
                        <div className="text-sm font-medium">{date}</div>
                        <div className="text-xs text-gray-500">{time}</div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-4 text-gray-500">
                    No available slots found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Appointment Type</label>
            <select
              name="type"
              value={localFormData.type}
              onChange={(e) => setLocalFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full rounded-lg bg-gray-50 border border-gray-100 p-3 text-gray-900"
              required
            >
              <option value="regular">Regular Checkup</option>
              <option value="followup">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="consultation">Consultation</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Reason for Visit</label>
            <input
              type="text"
              value={localFormData.reason}
              onChange={(e) => setLocalFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full rounded-lg bg-gray-50 border border-gray-100 p-3 text-gray-900"
              required
              placeholder="Please describe your reason for visiting"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Additional Notes (Optional)</label>
            <textarea
              value={localFormData.notes}
              onChange={(e) => setLocalFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full rounded-lg bg-gray-50 border border-gray-100 p-3 text-gray-900"
              placeholder="Any additional information you'd like to provide"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowBooking(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!localFormData.timeSlot}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2
                ${localFormData.timeSlot
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-lg hover:shadow-blue-500/20'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <FiCalendar className="h-5 w-5" />
              <span>Book Appointment</span>
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  const renderAppointments = () => {
    if (loading) {
      return <div className="text-center py-8 text-gray-600">Loading appointments...</div>;
    }

    if (!appointments.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          No {activeTab} appointments found
        </div>
      );
    }

    return appointments.map((appointment) => (
      <motion.div
        key={appointment._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-gray-50 
                   rounded-xl border border-gray-100 space-y-4 sm:space-y-0 transition-colors"
      >
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-blue-50 flex-shrink-0 
                         flex items-center justify-center text-blue-600">
            <FiUser className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {appointment.doctorId?.name || 'Pending Assignment'}
            </h4>
            <p className="text-sm text-gray-500">
              {appointment.doctorId?.specialization || 'Specialization Not Available'}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <div className="flex items-center text-sm text-gray-500">
                <FiCalendar className="h-4 w-4 mr-1" />
                <span className="whitespace-nowrap">
                  {new Date(appointment.timeSlot).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FiClock className="h-4 w-4 mr-1" />
                <span>
                  {new Date(appointment.timeSlot).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap
            ${appointment.status === 'approved' ? 'bg-green-50 text-green-600' :
              appointment.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
              appointment.status === 'cancelled' ? 'bg-red-50 text-red-600' :
              'bg-gray-50 text-gray-600'}`}>
            {appointment.status}
          </span>
          {appointment.status === 'pending' && (
            <button
              onClick={() => handleCancel(appointment._id)}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg 
                         hover:bg-red-100 transition-colors border border-red-200"
            >
              Cancel
            </button>
          )}
        </div>
      </motion.div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowBooking(!showBooking)}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-2 rounded-xl 
                     hover:shadow-lg hover:shadow-blue-500/20 transition-all"
        >
          <FiCalendar className="inline-block mr-2 h-5 w-5" />
          Book Appointment
        </motion.button>
      </div>

      {showBooking && <BookingForm />}

      {/* Appointments Tabs */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-xl p-6">
        <div className="overflow-x-auto">
          <div className="flex space-x-2 md:space-x-4 mb-6">
            {['pending', 'approved', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 md:px-4 py-2 rounded-lg font-medium capitalize text-sm md:text-base whitespace-nowrap
                  ${activeTab === tab 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Appointment List */}
        <div className="space-y-4">
          {renderAppointments()}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
