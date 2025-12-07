'use client';

import { motion } from 'framer-motion';

export default function ViewDialog({
  isOpen,
  salary,
  handleClose,
  isDarkMode,
  dialogVariants
}) {
  if (!salary) return null;

  return (
    <motion.div
      variants={dialogVariants}
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      exit="exit"
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!isOpen && 'hidden'}`}
    >
      <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
          Oylik ma'lumotlari
        </h2>
        <div className="space-y-3">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Xodim:</span>{' '}
            {salary.employee.first_name} {salary.employee.last_name}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Oy:</span>{' '}
            {new Date(salary.month).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Asosiy summa:</span>{' '}
            <span className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {salary.base_amount.toLocaleString()} UZS
            </span>
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Foiz summasi:</span>{' '}
            <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {salary.percentage_amount.toLocaleString()} UZS
            </span>
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Bonus:</span>{' '}
            <span className={`font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {salary.bonus_amount.toLocaleString()} UZS
            </span>
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Jami summa:</span>{' '}
            <span className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {salary.total_amount.toLocaleString()} UZS
            </span>
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Status:</span>{' '}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              salary.status === 'paid'
                ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                : salary.status === 'pending'
                ? isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                : isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
            }`}>
              {salary.status === 'paid' ? "To'langan" : 
               salary.status === 'pending' ? "Kutilmoqda" : "Bekor qilingan"}
            </span>
          </p>
          {salary.note && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-medium">Izoh:</span>{' '}
              {salary.note}
            </p>
          )}
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Yaratilgan sana:</span>{' '}
            {new Date(salary.createdAt).toLocaleDateString()}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">O'zgartirilgan sana:</span>{' '}
            {new Date(salary.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleClose}
            className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
          >
            Yopish
          </button>
        </div>
      </div>
    </motion.div>
  );
} 