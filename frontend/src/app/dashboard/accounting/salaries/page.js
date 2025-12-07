'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  PlusIcon,
  XMarkIcon, 
  TrashIcon, 
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ConfigDialog from './components/ConfigDialog';
import SalaryDialog from './components/SalaryDialog';

export default function SalariesPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [openSalaryDialog, setOpenSalaryDialog] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  });
  const [filters, setFilters] = useState({
    employee_id: '',
    start_date: null,
    end_date: null,
    status: '',
    search: ''
  });
  const [formData, setFormData] = useState({
    employee_id: '',
    month: '',
    base_amount: '',
    percentage_amount: '',
    bonus_amount: '',
    note: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const token = Cookies.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchEmployees();
    fetchSalaries();
  }, [token, pagination.currentPage, filters]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setEmployees(result.data || []);
      } else {
        console.error('API Error:', result);
        setSnackbar({
          open: true,
          message: result.message || 'Xodimlarni yuklashda xatolik',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setSnackbar({
        open: true,
        message: 'Xodimlarni yuklashda xatolik',
        severity: 'error'
      });
    }
  };

  const fetchSalaries = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...(filters.employee_id && { employee_id: filters.employee_id }),
        ...(filters.start_date && { start_date: filters.start_date.toISOString() }),
        ...(filters.end_date && { end_date: filters.end_date.toISOString() }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`http://localhost:5000/api/salaries?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSalaries(result.data || []);
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
          message: result.message || 'Oyliklarni yuklashda xatolik',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setSnackbar({
        open: true,
        message: 'Oyliklarni yuklashda xatolik',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleDateChange = (name, date) => {
    setFilters(prev => ({ ...prev, [name]: date }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/salaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: formData.employee_id,
          month: formData.month,
          base_amount: Number(formData.base_amount),
          percentage_amount: Number(formData.percentage_amount),
          bonus_amount: Number(formData.bonus_amount),
          note: formData.note
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: data.message || 'Oylik muvaffaqiyatli saqlandi',
          severity: 'success',
        });
        setFormData({
          employee_id: '',
          month: '',
          base_amount: '',
          percentage_amount: '',
          bonus_amount: '',
          note: ''
        });
        setOpenSalaryDialog(false);
        fetchSalaries();
      } else {
        throw new Error(data.message || 'Oylikni saqlashda xatolik');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/salaries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: data.message || 'Oylik statusi yangilandi',
          severity: 'success',
        });
        fetchSalaries();
      } else {
        throw new Error(data.message || 'Oylik statusini yangilashda xatolik');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Rostdan ham bu oylikni o\'chirmoqchimisiz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/salaries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Oylik o\'chirildi',
          severity: 'success'
        });
        fetchSalaries();
      } else {
        throw new Error(result.message || 'Oylikni o\'chirishda xatolik');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Xatolik yuz berdi',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const dialogVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
            Oylik boshqaruvi
          </h1>
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenConfigDialog(true)}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
              } text-white`}
            >
              <PlusIcon className="h-5 w-5 inline-block mr-2" />
              Konfiguratsiya
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenSalaryDialog(true)}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
              } text-white`}
            >
              <PlusIcon className="h-5 w-5 inline-block mr-2" />
              Oylik
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-xl p-4 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Xodim
                </label>
                <select
                  name="employee_id"
                  value={filters.employee_id}
                  onChange={handleFilterChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                <option value="">Barcha xodimlar</option>
                  {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Boshlanish sanasi
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tugash sanasi
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                <option value="">Barcha statuslar</option>
                  <option value="pending">Kutilmoqda</option>
                  <option value="paid">To'langan</option>
                  <option value="cancelled">Bekor qilingan</option>
                </select>
              </div>
            </div>
          </div>

        {/* Salaries Table */}
        <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="overflow-x-auto">
          <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Xodim
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Oy
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Asosiy summa
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Foiz summa
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Bonus
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Jami
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-center text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Amallar
                  </th>
              </tr>
            </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {salaries.map((salary) => (
                  <tr key={salary._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {salary.employee_id.first_name} {salary.employee_id.last_name}
                  </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {new Date(salary.month).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })}
                  </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {Number(salary.base_amount).toLocaleString()} UZS
                  </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {Number(salary.percentage_amount).toLocaleString()} UZS
                  </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {Number(salary.bonus_amount).toLocaleString()} UZS
                  </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {Number(salary.total_amount).toLocaleString()} UZS
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      salary.status === 'paid'
                        ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                          : salary.status === 'cancelled'
                          ? isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                          : isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {salary.status === 'paid' ? 'To\'langan' : salary.status === 'cancelled' ? 'Bekor qilingan' : 'Kutilmoqda'}
                    </span>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                    {salary.status === 'pending' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                              onClick={() => handleUpdateStatus(salary._id, 'paid')}
                              className={`p-1 rounded-full ${
                                isDarkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'
                              }`}
                              title="To'langan deb belgilash"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                              onClick={() => handleUpdateStatus(salary._id, 'cancelled')}
                              className={`p-1 rounded-full ${
                                isDarkMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-100'
                              }`}
                              title="Bekor qilish"
                            >
                              <XCircleIcon className="h-5 w-5" />
                        </motion.button>
                      </>
                    )}
                        {salary.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(salary._id)}
                            className={`p-1 rounded-full ${
                              isDarkMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-100'
                            }`}
                            title="O'chirish"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </motion.button>
                        )}
                      </div>
                  </td>
                  </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Pagination */}
          <div className={`px-6 py-4 flex items-center justify-between border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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

      {/* Config Dialog */}
        <ConfigDialog
          isOpen={openConfigDialog}
        formData={formData}
        handleSubmit={handleSubmit}
        handleClose={() => setOpenConfigDialog(false)}
        handleInputChange={handleInputChange}
          isDarkMode={isDarkMode}
          dialogVariants={dialogVariants}
          employees={employees}
          token={token}
        />

      {/* Salary Dialog */}
        <SalaryDialog
          isOpen={openSalaryDialog}
        formData={formData}
        handleSubmit={handleSubmit}
        handleClose={() => setOpenSalaryDialog(false)}
        handleInputChange={handleInputChange}
          isDarkMode={isDarkMode}
          dialogVariants={dialogVariants}
          employees={employees}
        token={token}
        />

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
  );
} 