'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiFile, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MedicalRecords = ({ onModalStateChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [medicines, setMedicines] = useState([]);

  const [formData, setFormData] = useState({
    type: '',
    diagnosis: '',
    treatment: '',
    doctorNotes: '',
    date: new Date().toISOString().split('T')[0],
    medications: [{ name: '', dosage: '', duration: '', quantity: 0, unit: '' }]
  });

  useEffect(() => {
    fetchPatients();
    fetchRecords();
    fetchMedicines();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/admin/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to fetch patients');
    }
  };

  const fetchRecords = async () => {
    try {
      const response = await axios.get('/api/admin/medical-records');
      setRecords(response.data);
    } catch (error) {
      toast.error('Failed to fetch records');
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await axios.get('/api/admin/inventory?category=Medicine');
      setMedicines(response.data.filter(item => item.quantity > 0));
    } catch (error) {
      toast.error('Failed to fetch medicines');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      doctorNotes: record.doctorNotes,
      date: new Date(record.date).toISOString().split('T')[0],
      medications: record.medications || [{ name: '', dosage: '', duration: '', quantity: 0, unit: '' }]
    });
    setSelectedPatient(record.patientId._id);
    setShowAddForm(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/medical-records/${recordToDelete._id}`);
      toast.success('Medical record deleted successfully');
      setRecords(records.filter(record => record._id !== recordToDelete._id));
    } catch (error) {
      toast.error('Failed to delete medical record');
    } finally {
      setShowDeleteModal(false);
      setRecordToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      diagnosis: '',
      treatment: '',
      doctorNotes: '',
      date: new Date().toISOString().split('T')[0],
      medications: [{ name: '', dosage: '', duration: '', quantity: 0, unit: '' }]
    });
    setSelectedPatient('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRecord) {
        // If editing, call update endpoint
        const response = await axios.put(`/api/admin/medical-records/${editingRecord._id}`, {
          ...formData,
          patientId: selectedPatient
        });
        toast.success('Medical record updated successfully');
      } else {
        // If creating new record
        const response = await axios.post('/api/admin/medical-records/prescription', {
          ...formData,
          patientId: selectedPatient
        });
        toast.success('Medical record and prescriptions added successfully');
      }

      setShowAddForm(false);
      resetForm();
      fetchRecords();
      fetchMedicines();

    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process record');
    } finally {
      setLoading(false);
      setEditingRecord(null);
    }
  };

  // Add new form field for managing medications
  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', duration: '', quantity: 0, unit: '' }]
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    setFormData(prev => ({ ...prev, medications: updatedMedications }));
  };

  // Update medication selection handler
  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    const medication = updatedMedications[index];

    if (field === 'name') {
      const inventoryItem = medicines.find(m => m.name === value);
      if (inventoryItem) {
        medication.unit = inventoryItem.unit;
        medication.price = inventoryItem.price;
      }
    }

    medication[field] = value;
    setFormData(prev => ({ ...prev, medications: updatedMedications }));
  };

  return (
    <div className="p-6">
      {/* Header with search - Updated styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-2xl bg-gradient-to-r font-bold from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Medical Records Management
          </h1>
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg bg-gray-900/50 border-white/10 text-gray-100 
                       focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-gray-500"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-500" />
          </div>
        </div>
        <button
          onClick={() => {
            setEditingRecord(null);
            resetForm();
            setShowAddForm(true);
          }}
          className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-4 py-2 rounded-lg 
                   hover:shadow-lg shadow-violet-500/20 transition-all border border-white/10 flex items-center gap-2"
        >
          <FiPlus /> Add New Record
        </button>
      </div>

      {/* Records List */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl divide-y divide-white/10">
        {records
          .filter(record => 
            record.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((record) => (
            <div key={record._id} className="p-4 hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                    <FiFile className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-100">{record.type}</h4>
                    <p className="text-sm text-gray-400">
                      Patient: {record.patientId?.fullName}
                    </p>
                    <p className="text-sm text-gray-400">
                      Date: {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-2 text-violet-400 hover:bg-violet-500/20 rounded-lg transition-colors"
                  >
                    <FiEdit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setRecordToDelete(record);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-100">
                {editingRecord ? 'Edit Medical Record' : 'Add New Medical Record'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingRecord(null);
                  resetForm();
                  onModalStateChange?.(false);
                }}
                className="text-gray-400 hover:text-gray-200"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Patient *</label>
                  {editingRecord ? (
                    <input
                      type="text"
                      value={editingRecord.patientId.fullName}
                      disabled
                      className="w-full rounded-lg bg-gray-900/50 border-white/10 p-3 text-gray-400"
                    />
                  ) : (
                    <select
                      required
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                      className="w-full rounded-lg bg-gray-900/50 border-white/10 p-3 text-gray-100 focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="" className="bg-gray-900">Select Patient</option>
                      {patients.map(patient => (
                        <option key={patient._id} value={patient._id} className="bg-gray-900">
                          {patient.fullName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Record Type *</label>
                  <input
                    type="text"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-lg bg-gray-900/50 border-white/10 p-3 text-gray-100 focus:ring-2 focus:ring-violet-500 placeholder-gray-500"
                    placeholder="e.g., General Checkup, Lab Test"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-lg bg-gray-900/50 border-white/10 p-3 text-gray-100 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Diagnosis *</label>
                <textarea
                  required
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  className="w-full rounded-lg bg-gray-900/50 border-white/10 p-3 text-gray-100 focus:ring-2 focus:ring-violet-500"
                  rows="3"
                  placeholder="Enter diagnosis details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Treatment *</label>
                <textarea
                  required
                  value={formData.treatment}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                  className="w-full rounded-lg bg-gray-900/50 border-white/10 p-3 text-gray-100 focus:ring-2 focus:ring-violet-500"
                  rows="3"
                  placeholder="Enter treatment details"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Medications</label>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="text-purple-600 hover:text-purple-700 text-sm"
                  >
                    + Add Medication
                  </button>
                </div>
                {formData.medications.map((med, index) => (
                  <div key={index} className="flex items-center gap-4 mb-4">
                    <div className="grid grid-cols-4 gap-4 flex-1">
                      <select
                        value={med.name}
                        onChange={(e) => {
                          const selectedMedicine = medicines.find(m => m.name === e.target.value);
                          updateMedication(index, 'name', e.target.value);
                          if (selectedMedicine) {
                            updateMedication(index, 'unit', selectedMedicine.unit);
                          }
                        }}
                        className="w-full rounded-lg bg-gray-900/50 border-white/10 p-3 text-gray-100 focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="">Select Medicine</option>
                        {medicines.map(medicine => (
                          <option key={medicine._id} value={medicine.name}>
                            {medicine.name} ({medicine.quantity} {medicine.unit} available)
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={med.quantity}
                        min="1"
                        onChange={(e) => {
                          const selectedMedicine = medicines.find(m => m.name === med.name);
                          const value = parseInt(e.target.value);
                          if (!selectedMedicine || value <= selectedMedicine.quantity) {
                            updateMedication(index, 'quantity', value);
                          } else {
                            toast.error(`Maximum available quantity is ${selectedMedicine.quantity}`);
                          }
                        }}
                        className="w-full rounded-lg bg-gray-900/50 border-white/10 p-3 text-gray-100 focus:ring-2 focus:ring-violet-500"
                      />
                      <input
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        className="w-full rounded-lg bg-gray-900/50 border-white/10 p-3 text-gray-100 focus:ring-2 focus:ring-violet-500"
                      />
                      <input
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        className="w-full rounded-lg bg-gray-900/50 border-white/10 p-3 text-gray-100 focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Doctor's Notes</label>
                <textarea
                  value={formData.doctorNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctorNotes: e.target.value }))}
                  className="w-full rounded-lg bg-gray-900/50 border-white/10 p-3 text-gray-100 focus:ring-2 focus:ring-violet-500"
                  rows="3"
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingRecord(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-lg hover:shadow-lg shadow-violet-500/20 transition-all border border-white/10"
                >
                  {loading ? 'Saving...' : editingRecord ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-gray-100 mb-4">Delete Medical Record</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this medical record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg"
              >
                Delete Record
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
