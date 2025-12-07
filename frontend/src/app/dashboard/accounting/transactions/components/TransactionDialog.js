'use client';

import { motion } from 'framer-motion';

export default function TransactionDialog({
  isOpen,
  isCreateMode,
  formData,
  handleInputChange,
  handleSubmit,
  handleClose,
  isDarkMode,
  paymentMethods,
  dialogVariants
}) {
  // Amount validation
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) > 0 && !isNaN(value))) {
      handleInputChange(e);
    }
  };

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
          {isCreateMode ? 'Yangi Tranzaksiya' : 'Tranzaksiyani Tahrirlash'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isCreateMode && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tranzaksiya turi
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                  <option value="income">Kirim</option>
                  <option value="expense">Chiqim</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Summa
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  required
                  min="0.01"
                  step="0.01"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Summani kiriting"
                />
              </div>
            </>
          )}

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Sana
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              pattern="\d{4}-\d{2}-\d{2}"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              To'lov turi
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Izoh
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              placeholder="Izoh kiriting"
            />
          </div>

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
              type="submit"
              className={`px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
            >
              {isCreateMode ? 'Yaratish' : 'Yangilash'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
} 