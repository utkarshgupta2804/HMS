'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function AdminSignin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      
      const response = await axios.post('/api/admin/signin', formData);
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        toast.success('Login successful');
        // Use direct window location change for hard redirect
        window.location.href = '/admin';  // Changed from /admin/dashboard to /admin
      }
    } catch (error) {
      console.error('Login error details:', error.response?.data);
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="fixed -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="fixed bottom-0 left-0 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 blur-3xl opacity-20"
        />
      </div>

      {/* Hospital Logo/Name */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center relative z-10"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">HMS</h1>
        <div className="h-1 w-20 bg-gradient-to-r from-violet-600 to-cyan-600 mx-auto rounded-full"></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="bg-violet-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiShield className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Admin Portal</h1>
          <p className="text-gray-400 mt-2">Secure access to admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/50 border border-white/10 
                         text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/50 border border-white/10 
                         text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white py-4 rounded-xl 
                     transition-all disabled:opacity-50 flex items-center justify-center space-x-2 
                     shadow-lg shadow-violet-500/20 border border-white/10"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiShield className="w-5 h-5" />
                <span>Access Admin Panel</span>
              </>
            )}
          </motion.button>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-sm text-gray-400 mt-4"
          >
            This is a secure area. Please verify your credentials.
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
}
