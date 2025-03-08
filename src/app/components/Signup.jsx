'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/signup', {
        ...formData,
        // Remove confirmPassword as it's not in our schema
        confirmPassword: undefined
      });
      
      setSuccess(true);
      toast.success('Registration successful!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Something went wrong';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Add visual feedback for email field if user exists
      if (err.response?.status === 409) {
        const emailInput = document.getElementById('email');
        emailInput.classList.add('border-red-500');
        emailInput.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    { id: 'fullName', label: "Patient's Full Name", type: 'text' },
    { id: 'email', label: 'Email Address', type: 'email' },
    { id: 'phone', label: 'Contact Number', type: 'tel' },
    { id: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { id: 'password', label: 'Create Password', type: 'password' },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white relative flex items-center justify-center p-4 overflow-x-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.2]" />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="fixed -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-r from-blue-100 to-violet-100 blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="fixed bottom-0 left-0 w-96 h-96 rounded-full bg-gradient-to-r from-blue-100 to-violet-100 blur-3xl opacity-20"
        />
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-100 shadow-[0_0_50px_rgba(0,0,0,0.1)] text-center relative z-10"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <motion.svg 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">
              Registration Complete!
            </h2>
            <p className="text-gray-600 mb-6">Your account has been created successfully.</p>
            <Link href="/signin">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(37, 99, 235, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-3 rounded-xl
                          shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Continue to Sign In
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md relative z-10"
          >
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-100 shadow-[0_0_50px_rgba(0,0,0,0.1)]">
              <h2 className="text-3xl font-bold text-blue-600 mb-2 text-center">
                Patient Registration
              </h2>
              <p className="text-center text-gray-600 mb-6">Create your patient account to get started</p>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-sm"
                >
                  {error}
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {formFields.map((field) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative group"
                  >
                    {field.type === 'select' ? (
                      <>
                        <label
                          htmlFor={field.id}
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          {field.label}
                        </label>
                        <select
                          id={field.id}
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          value={formData[field.id]}
                          onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                          required
                        >
                          <option value="" className="bg-white">Select {field.label}</option>
                          {field.options.map(option => (
                            <option key={option} value={option} className="bg-white">{option}</option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <div className="relative">
                        <label
                          htmlFor={field.id}
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          id={field.id}
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl 
                                   text-gray-900 placeholder:text-gray-400 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Enter your ${field.label.toLowerCase()}`}
                          value={formData[field.id]}
                          onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                          required
                        />
                      </div>
                    )}
                  </motion.div>
                ))}

                <motion.button
                  whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(37, 99, 235, 0.2)" }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white py-4 rounded-xl
                            font-medium text-lg shadow-lg hover:shadow-blue-500/50 
                            transition-all"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
                    />
                  ) : (
                    "Register as Patient"
                  )}
                </motion.button>
              </form>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center text-gray-600"
              >
                Already have an account?{' '}
                <Link href="/signin" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign In
                </Link>
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Signup;
