'use client';

import { motion } from 'framer-motion';

export default function DeleteDialog({
  isOpen,
  handleDelete,
  handleClose,
  isDarkMode,
  dialogVariants
}) {
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
          Bekor qilishni tasdiqlash
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Siz haqiqatan ham ushbu tranzaksiyani bekor qilmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
        </p>
        <div className="flex justify-end space-x-3 mt-6">
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
            onClick={handleDelete}
            className={`px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
              }`}
          >
            O'chirish
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 