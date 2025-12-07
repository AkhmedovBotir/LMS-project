'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function SalaryDialog({
  isOpen,
  formData,
  handleSubmit,
  handleClose,
  handleInputChange,
  isDarkMode,
  dialogVariants,
  employees,
  token
}) {
  const [calculatedSalary, setCalculatedSalary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateSalary = async () => {
    if (!formData.employee_id || !formData.month) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/salaries/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: formData.employee_id,
          month: formData.month
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setCalculatedSalary(result.data);
        handleInputChange({ target: { name: 'base_amount', value: result.data.base_amount } });
        handleInputChange({ target: { name: 'percentage_amount', value: result.data.percentage_amount } });
      } else {
        setError(result.message || 'Hisoblashda xatolik yuz berdi');
      }
    } catch (err) {
      console.error('Calculate error:', err);
      setError('Hisoblashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.employee_id && formData.month) {
      calculateSalary();
        }
  }, [formData.employee_id, formData.month]);

  return (
    <motion.div
      variants={dialogVariants}
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      exit="exit"
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!isOpen && 'hidden'}`}
    >
      <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
          Yangi oylik
        </h2>
          <button
            onClick={handleClose}
            className={`font-bold text-black rounded-lg ${isDarkMode ? 'hover:bg-gray-100' : 'hover:bg-gray-200'}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Xodim
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            >
              <option value="">Xodimni tanlang</option>
              {employees.map(employee => (
                <option key={employee._id} value={employee._id}>
                  {employee.first_name} {employee.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Oy
            </label>
            <input
              type="month"
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Asosiy summa
            </label>
            <input
              type="number"
              name="base_amount"
              value={formData.base_amount}
              onChange={handleInputChange}
              required
              min="0"
              step="1000"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              placeholder="Asosiy summani kiriting"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Foiz summa
            </label>
            <input
              type="number"
              name="percentage_amount"
              value={formData.percentage_amount}
              onChange={handleInputChange}
              required
              min="0"
              step="1000"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              placeholder="Foiz summani kiriting"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Bonus
            </label>
            <input
              type="number"
              name="bonus_amount"
              value={formData.bonus_amount}
              onChange={handleInputChange}
              required
              min="0"
              step="1000"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              placeholder="Bonus summani kiriting"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Izoh
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows="3"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              placeholder="Izoh kiriting"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Bekor qilish
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              Saqlash
            </motion.button>
          </div>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg ${
              isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'
            }`}
          >
            {error}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 