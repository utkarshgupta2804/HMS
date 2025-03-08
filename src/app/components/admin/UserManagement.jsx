'use client';
import React, { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiEdit2, FiEye, FiX, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [userRole, setUserRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  };
  
  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      
      const response = await axios.get('/api/admin/users');
      console.log('Response:', response.data);
      
      setUsers(response.data);
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to fetch users: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`/api/admin/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data.success) {
        toast.success('User deleted successfully');
        await fetchUsers(); // Refresh the list
        if (showUserModal) {
          setShowUserModal(false);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const canDeleteUser = (userToDelete) => {
    // If viewer is superadmin, they can delete anyone except superadmins
    if (userRole === 'superadmin') {
      return userToDelete.role !== 'superadmin';
    }
    
    // If viewer is admin, they can only delete patients
    if (userRole === 'admin') {
      return userToDelete.role === 'patient';
    }

    return true;
  };

  const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;
    console.log("Role:",userRole);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">User Details</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <p className="font-medium text-gray-900">{user.fullName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Gender</label>
                <p className="font-medium text-gray-900">{user.gender}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date of Birth</label>
                <p className="font-medium text-gray-900">
                  {new Date(user.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Role</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1
                  ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                    user.role === 'doctor' ? 'bg-blue-100 text-blue-700' : 
                    'bg-green-100 text-green-700'}`}>
                  {user.role}
                </span>
              </div>
              <div>
                <label className="text-sm text-gray-500">Joined On</label>
                <p className="font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Add delete button section */}
          {canDeleteUser(user) && (
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
                    handleDeleteUser(user._id, user.fullName);
                    onClose();
                  }
                }}
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <FiTrash2 className="h-5 w-5" />
                <span>Delete User</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  const CreateUserModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      password: '',
      role: 'patient'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('/api/admin/users', formData);
        if (response.data.success) {
          toast.success('User created successfully');
          fetchUsers();
          onClose();
        }
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to create user');
      }
    };

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl w-full max-w-md"
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-100">Create New User</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                className="mt-1 block w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 
                       text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-violet-500"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="mt-1 block w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 
                       text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-violet-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                className="mt-1 block w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 
                       text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-violet-500"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                className="mt-1 block w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 
                       text-gray-100 focus:ring-2 focus:ring-violet-500"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
              <select
                name="gender"
                required
                className="mt-1 block w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 
                       text-gray-100 focus:ring-2 focus:ring-violet-500"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="" className="bg-gray-900">Select gender</option>
                <option value="Male" className="bg-gray-900">Male</option>
                <option value="Female" className="bg-gray-900">Female</option>
                <option value="Other" className="bg-gray-900">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="mt-1 block w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 
                       text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-violet-500"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
              <select
                name="role"
                required
                className="mt-1 block w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 
                       text-gray-100 focus:ring-2 focus:ring-violet-500"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="patient" className="bg-gray-900">Patient</option>
                <option value="doctor" className="bg-gray-900">Doctor</option>
                {userRole === 'superadmin' && (
                  <option value="admin" className="bg-gray-900">Admin</option>
                )}
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-lg 
                       hover:shadow-lg shadow-violet-500/20 transition-all border border-white/10"
              >
                Create User
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          User Management
        </h2>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-4 py-2 rounded-xl
                     hover:shadow-lg shadow-violet-500/20 transition-all border border-white/10"
          >
            <FiPlus className="mr-2 inline" />
            Create User
          </button>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:border-blue-600 focus:ring-blue-600 w-full sm:w-auto"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            {userRole === 'superadmin' && <option value="admin">Admins</option>}
          </select>
          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-blue-600 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden md:rounded-xl">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map((user) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-100">{user.fullName}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium 
                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                              user.role === 'doctor' ? 'bg-blue-100 text-blue-700' : 
                              'bg-green-100 text-green-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-2 text-blue-600 hover:text-blue-900 transition-colors"
                              title="View Details"
                            >
                              <FiEye className="h-5 w-5" />
                            </button>
                            {canDeleteUser(user) && (
                              <button
                                onClick={() => handleDeleteUser(user._id, user.fullName)}
                                className="p-2 text-red-600 hover:text-red-900 transition-colors"
                                title="Delete User"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default UserManagement;
