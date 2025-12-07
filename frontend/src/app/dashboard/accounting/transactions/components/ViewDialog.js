'use client';

import { motion } from 'framer-motion';

export default function ViewDialog({
  isOpen,
  transaction,
  handleClose,
  isDarkMode,
  paymentMethods,
  dialogVariants
}) {
  if (!transaction) return null;

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
          Tranzaksiya Ma'lumotlari
        </h2>
        <div className="space-y-3">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Tranzaksiya turi:</span>{' '}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              transaction.type === 'income'
                ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                : isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
            }`}>
              {transaction.type === 'income' ? 'Kirim' : 'Chiqim'}
            </span>
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Summa:</span>{' '}
            <span className={`font-medium ${
              transaction.type === 'income'
                ? isDarkMode ? 'text-green-400' : 'text-green-600'
                : isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              {transaction.amount.toLocaleString()} UZS
            </span>
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Sana:</span> {new Date(transaction.date).toLocaleDateString()}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">To'lov turi:</span>{' '}
            {paymentMethods.find(m => m.value === transaction.payment_method)?.label || transaction.payment_method}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Izoh:</span> {transaction.description}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Status:</span>{' '}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              transaction.status === 'active'
                ? isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'
            }`}>
              {transaction.status === 'active' ? 'Faol' : 'Bekor qilingan'}
            </span>
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