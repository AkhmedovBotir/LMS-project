'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/authContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Background animation variants
  const backgroundVariants = {
    animate: {
      background: isDarkMode
        ? ['linear-gradient(45deg, #1e3a8a, #4b0082)', 'linear-gradient(45deg, #4b0082, #1e3a8a)']
        : ['linear-gradient(45deg, #3b82f6, #7c3aed)', 'linear-gradient(45deg, #7c3aed, #3b82f6)'],
      transition: {
        duration: 10,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  };

  // Floating orb animation variants
  const orbVariants = {
    animate: {
      x: [0, 50, -50, 0],
      y: [0, -30, 30, 0],
      scale: [1, 1.2, 1, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 8,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      },
    },
  };

  // Loading animation variants
  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Animated Background Layer */}
      <motion.div
        className="absolute inset-0 z-0"
        variants={backgroundVariants}
        animate="animate"
      >
        {/* Floating Orbs for Visual Effect */}
        <motion.div
          className={`absolute w-64 h-64 rounded-full blur-3xl ${
            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-400/30'
          } top-10 left-10`}
          variants={orbVariants}
          animate="animate"
        />
        <motion.div
          className={`absolute w-96 h-96 rounded-full blur-3xl ${
            isDarkMode ? 'bg-purple-900/30' : 'bg-purple-400/30'
          } bottom-20 right-20`}
          variants={orbVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
        />
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-lg ${
          isDarkMode
            ? 'bg-gray-800/80 border border-gray-700/50'
            : 'bg-white/80 border border-gray-200/50'
        }`}
        style={{ boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.2)' }}
      >
        <div className="text-center">
          <h2 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Tizimga kirish
          </h2>
          <p className={`text-sm mb-6 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            CRM tizimidan foydalanish uchun tizimga kiring
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Username
            </label>
            <div className="relative">
              <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all backdrop-blur-sm`}
                placeholder="Username kiriting"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Parol
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full pl-4 pr-10 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all backdrop-blur-sm`}
                placeholder="Parolni kiriting"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className={`h-5 w-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                ) : (
                  <EyeIcon className={`h-5 w-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-md p-4 ${
                isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-800'
              }`}
            >
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 rounded ${
                  isDarkMode
                    ? 'text-blue-500 focus:ring-blue-500 border-gray-600'
                    : 'text-indigo-600 focus:ring-indigo-500 border-gray-300'
                }`}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Eslab qolish
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className={`font-medium ${
                  isDarkMode
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-indigo-600 hover:text-indigo-500'
                }`}
              >
                Parolni unutdingizmi?
              </a>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white shadow-lg ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center`}
          >
            {loading ? (
              <>
                <motion.div
                  variants={loadingVariants}
                  animate="animate"
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Kirish...
              </>
            ) : (
              'Kirish'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}