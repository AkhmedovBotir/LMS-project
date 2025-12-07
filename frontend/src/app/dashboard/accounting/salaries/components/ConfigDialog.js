'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ConfigDialog({
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
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  });
  const [filters, setFilters] = useState({
    employee_id: '',
    status: 'active',
    search: ''
  });
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConfigs();
    }
  }, [isOpen, pagination.currentPage, filters]);

  const fetchConfigs = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...(filters.employee_id && { employee_id: filters.employee_id }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`http://localhost:5000/api/salaries/config?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setConfigs(result.data || []);
        setPagination({
          ...pagination,
          total: result.pagination?.total || 0,
          totalPages: result.pagination?.total_pages || 1,
          currentPage: result.pagination?.page || 1
        });
      } else {
        console.error('API Error:', result);
        setSnackbar({
          open: true,
          message: result.message || 'Konfiguratsiyalarni yuklashda xatolik',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setSnackbar({
        open: true,
        message: 'Konfiguratsiyalarni yuklashda xatolik',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditConfig = (config) => {
    console.log('Config to edit:', config);
    setSelectedConfig(config);
    setIsEditing(true);
    handleInputChange({ target: { name: 'employee_id', value: config.employee_id._id } });
    handleInputChange({ target: { name: 'base_salary', value: config.base_salary } });
    handleInputChange({ target: { name: 'student_percentage', value: config.student_percentage } });
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/salaries/config/${selectedConfig._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          base_salary: Number(formData.base_salary),
          student_percentage: Number(formData.student_percentage)
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: data.message || 'Konfiguratsiya yangilandi',
          severity: 'success',
        });
        setIsEditing(false);
        setSelectedConfig(null);
        handleInputChange({ target: { name: 'employee_id', value: '' } });
        handleInputChange({ target: { name: 'base_salary', value: '' } });
        handleInputChange({ target: { name: 'student_percentage', value: '' } });
        fetchConfigs();
      } else {
        throw new Error(data.message || 'Konfiguratsiyani yangilashda xatolik');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedConfig(null);
    handleInputChange({ target: { name: 'employee_id', value: '' } });
    handleInputChange({ target: { name: 'base_salary', value: '' } });
    handleInputChange({ target: { name: 'student_percentage', value: '' } });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/salaries/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: formData.employee_id,
          base_salary: Number(formData.base_salary),
          student_percentage: Number(formData.student_percentage)
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: data.message || 'Konfiguratsiya yaratildi',
          severity: 'success',
        });
        handleInputChange({ target: { name: 'employee_id', value: '' } });
        handleInputChange({ target: { name: 'base_salary', value: '' } });
        handleInputChange({ target: { name: 'student_percentage', value: '' } });
        fetchConfigs();
    } else {
        throw new Error(data.message || 'Konfiguratsiyani yaratishda xatolik');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleDeleteConfig = async (id) => {
    if (!confirm('Rostdan ham bu konfiguratsiyani o\'chirmoqchimisiz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/salaries/config/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Konfiguratsiya o\'chirildi',
          severity: 'success'
        });
        fetchConfigs();
      } else {
        throw new Error(result.message || 'Konfiguratsiyani o\'chirishda xatolik');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Xatolik yuz berdi',
        severity: 'error'
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <motion.div
      variants={dialogVariants}
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      exit="exit"
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!isOpen && 'hidden'}`}
    >
      <div className={`rounded-xl p-6 w-full max-w-7xl h-[90vh] backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
            {isEditing ? 'Konfiguratsiyani tahrirlash' : 'Yangi konfiguratsiya'}
          </h2>
          <button
            onClick={handleClose}
            className={`font-bold text-black rounded-lg ${isDarkMode ? 'hover:bg-gray-100' : 'hover:bg-gray-200'}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 h-[calc(100%-4rem)] overflow-hidden">
          {/* Left side - Configuration Form */}
          <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50/50'} overflow-y-auto`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {isEditing ? 'Konfiguratsiyani tahrirlash' : 'Yangi konfiguratsiya'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
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
                      {employee.first_name} {employee.last_name} ({employee.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Asosiy oylik
                </label>
                <input
                  type="number"
                  name="base_salary"
                  value={formData.base_salary}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1000"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Asosiy oylik summasini kiriting"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  O'quvchilar to'lovidan foiz (0-100)
                </label>
                <input
                  type="number"
                  name="student_percentage"
                  value={formData.student_percentage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="1"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Foizni kiriting (0-100)"
                />
              </div>

              <div className="flex justify-end space-x-3">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className={`px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    Bekor qilish
                  </button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-white ${
                    isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  {isEditing ? 'Yangilash' : 'Saqlash'}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Right side - Configurations List */}
          <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50/50'} flex flex-col h-full`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Mavjud konfiguratsiyalar
              </h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Qidirish..."
                  className={`px-3 py-1 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className={`px-3 py-1 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                  <option value="active">Faol</option>
                  <option value="inactive">Nofaol</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="overflow-y-auto flex-1">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className={isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}>
                      <th className={`px-4 py-2 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Xodim</th>
                      <th className={`px-4 py-2 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Asosiy oylik</th>
                      <th className={`px-4 py-2 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Foiz</th>
                      <th className={`px-4 py-2 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                      <th className={`px-4 py-2 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {configs.map((config) => (
                      <tr key={config._id} className={isDarkMode ? 'border-b border-gray-600' : 'border-b border-gray-200'}>
                        <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {config.employee_id.first_name} {config.employee_id.last_name}
                        </td>
                        <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {Number(config.base_salary).toLocaleString()} UZS
                        </td>
                        <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {config.student_percentage}%
                        </td>
                        <td className={`px-4 py-2`}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            config.status === 'active'
                              ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                              : isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                          }`}>
                            {config.status === 'active' ? 'Faol' : 'Nofaol'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex justify-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditConfig(config)}
                              className={`p-1 rounded-full ${
                                isDarkMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-100'
                              }`}
                            >
                              <PencilIcon className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteConfig(config._id)}
                              className={`p-1 rounded-full ${
                                isDarkMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-100'
                              }`}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 mt-auto">
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  Jami {pagination.total} ta
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      pagination.currentPage === 1
                        ? isDarkMode
                          ? 'bg-gray-600 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isDarkMode
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Oldingi
                  </button>
                  <div className={`px-3 py-1 rounded-md ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {pagination.currentPage} / {pagination.totalPages}
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-3 py-1 rounded-md ${
                      pagination.currentPage === pagination.totalPages
                        ? isDarkMode
                          ? 'bg-gray-600 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isDarkMode
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Keyingi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Snackbar */}
        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
              snackbar.severity === 'success'
                ? isDarkMode
                  ? 'bg-green-600'
                  : 'bg-green-500'
                : isDarkMode
                  ? 'bg-red-600'
                  : 'bg-red-500'
              } text-white`}
          >
            <p>{snackbar.message}</p>
            <button
              onClick={handleCloseSnackbar}
              className="absolute top-1 right-2 text-white"
            >
              ×
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 