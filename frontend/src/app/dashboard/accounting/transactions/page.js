'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import TransactionDialog from './components/TransactionDialog';
import ViewDialog from './components/ViewDialog';
import DeleteDialog from './components/DeleteDialog';

export default function TransactionsPage() {
  const { user, token } = useAuth();
  const { isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categoryBreakdown: [],
    typeBreakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  });
  const [filters, setFilters] = useState({
    type: '',
    payment_method: '',
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: '',
    search: ''
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash'
  });

  // Categories
  const categories = {
    income: ['Salary', 'Investment', 'Sales', 'Other'],
    expense: ['Utilities', 'Rent', 'Supplies', 'Salaries', 'Marketing', 'Other']
  };

  // Payment methods
  const paymentMethods = [
    { value: 'cash', label: 'Naqd' },
    { value: 'card', label: 'Karta' },
    { value: 'transfer', label: 'O\'tkazma' }
  ];

  // Dialog animations
  const dialogVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  useEffect(() => {
    if (token) {
      fetchTransactions();
      fetchSummary();
    }
  }, [token, pagination.currentPage, filters]);

  const fetchTransactions = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        type: filters.type,
        payment_method: filters.payment_method,
        start_date: filters.start_date,
        end_date: filters.end_date,
        min_amount: filters.min_amount,
        max_amount: filters.max_amount
      });

      const response = await fetch(`http://localhost:5000/api/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setTransactions(result.data || []);
        setPagination({
          ...pagination,
          total: result.pagination?.total || 0,
          totalPages: result.pagination?.total_pages || 1,
          currentPage: result.pagination?.page || 1,
          limit: result.pagination?.limit || 10
        });
        // Update summary from the same response
        setSummary({
          totalIncome: result.summary?.income || 0,
          totalExpense: result.summary?.expense || 0,
          balance: result.summary?.balance || 0,
          typeBreakdown: []
        });
      } else {
        console.error('API Error:', result);
        setError(result.message || 'Tranzaksiyalarni yuklashda xatolik');
        setTransactions([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Tranzaksiyalarni yuklashda xatolik');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const queryParams = new URLSearchParams({
        start_date: filters.start_date,
        end_date: filters.end_date
      });

      const response = await fetch(`http://localhost:5000/api/transactions/summary?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSummary({
          totalIncome: result.data.total_income || 0,
          totalExpense: result.data.total_expense || 0,
          balance: result.data.balance || 0,
          typeBreakdown: [
            { type: 'income', ...result.data.by_type?.income },
            { type: 'expense', ...result.data.by_type?.expense }
          ]
        });
      } else {
        console.error('API Error:', result);
      }
    } catch (err) {
      console.error('Summary fetch error:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: formData.type,
          amount: Number(formData.amount),
          description: formData.description,
          date: formData.date,
          payment_method: formData.payment_method
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: data.message || 'Tranzaksiya muvaffaqiyatli yaratildi',
          severity: 'success',
        });
        fetchTransactions();
        fetchSummary();
        handleCloseDialog();
      } else {
        throw new Error(data.message || 'Tranzaksiya yaratishda xatolik');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${currentTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: formData.description,
          date: formData.date,
          payment_method: formData.payment_method
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: data.message || 'Tranzaksiya muvaffaqiyatli yangilandi',
          severity: 'success',
        });
        fetchTransactions();
        fetchSummary();
        handleCloseDialog();
      } else {
        throw new Error(data.message || 'Tranzaksiyani yangilashda xatolik');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!currentTransaction?._id) {
      setSnackbar({
        open: true,
        message: 'Tranzaksiya ID si ko\'rsatilmagan',
        severity: 'error',
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${currentTransaction._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSnackbar({
          open: true,
          message: data.message || 'Tranzaksiya muvaffaqiyatli bekor qilindi',
          severity: 'success',
        });
        fetchTransactions();
        fetchSummary();
        handleCloseDialog();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Tranzaksiyani bekor qilishda xatolik');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleOpenCreateDialog = () => {
    setCurrentTransaction(null);
    setFormData({
      type: 'income',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      payment_method: 'cash'
    });
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (transaction) => {
    setCurrentTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split('T')[0],
      payment_method: transaction.payment_method
    });
    setOpenEditDialog(true);
  };

  const handleOpenViewDialog = (transaction) => {
    setCurrentTransaction(transaction);
    setOpenViewDialog(true);
  };

  const handleOpenDeleteDialog = (transaction) => {
    setCurrentTransaction(transaction);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
    setOpenViewDialog(false);
    setOpenDeleteDialog(false);
    setCurrentTransaction(null);
    setFormData({
      type: 'income',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      payment_method: 'cash'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
            Kirim-Chiqimlar
          </h1>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtrlar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenCreateDialog(true)}
              className={`flex items-center px-4 py-2 rounded-lg text-white ${
                isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Yangi Tranzaksiya
            </motion.button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Income Card */}
          <div className={`rounded-xl p-6 ${
            isDarkMode
              ? 'bg-gray-800/80 border border-gray-700/50'
              : 'bg-white/80 border border-gray-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Umumiy Kirimlar
              </h3>
              <ArrowUpIcon className="h-6 w-6 text-green-500" />
            </div>
            <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {summary.totalIncome.toLocaleString()} UZS
            </p>
          </div>

          {/* Total Expense Card */}
          <div className={`rounded-xl p-6 ${
            isDarkMode
              ? 'bg-gray-800/80 border border-gray-700/50'
              : 'bg-white/80 border border-gray-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Umumiy Chiqimlar
              </h3>
              <ArrowDownIcon className="h-6 w-6 text-red-500" />
            </div>
            <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {summary.totalExpense.toLocaleString()} UZS
            </p>
          </div>

          {/* Balance Card */}
          <div className={`rounded-xl p-6 ${
            isDarkMode
              ? 'bg-gray-800/80 border border-gray-700/50'
              : 'bg-white/80 border border-gray-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Balans
              </h3>
              <span className={`text-xl ${summary.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {summary.balance >= 0 ? '+' : '-'}
              </span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${
              summary.balance >= 0
                ? isDarkMode ? 'text-green-400' : 'text-green-600'
                : isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              {Math.abs(summary.balance).toLocaleString()} UZS
            </p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className={`rounded-xl p-6 mb-6 ${
            isDarkMode
              ? 'bg-gray-800/80 border border-gray-700/50'
              : 'bg-white/80 border border-gray-200/50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tranzaksiya turi
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                  <option value="">Barchasi</option>
                  <option value="income">Kirim</option>
                  <option value="expense">Chiqim</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  To'lov turi
                </label>
                <select
                  name="payment_method"
                  value={filters.payment_method}
                  onChange={handleFilterChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                  <option value="">Barchasi</option>
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
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
                  Minimal summa
                </label>
                <input
                  type="number"
                  name="min_amount"
                  value={filters.min_amount}
                  onChange={handleFilterChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="0"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Maksimal summa
                </label>
                <input
                  type="number"
                  name="max_amount"
                  value={filters.max_amount}
                  onChange={handleFilterChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="1000000"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Qidirish
                </label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Izoh bo'yicha qidirish..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className={`rounded-xl shadow-lg overflow-hidden backdrop-blur-sm ${
          isDarkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/80 border border-gray-200/50'
        }`}>
          <table className="w-full">
            <thead>
              <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sana</th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tur</th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Summa</th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>To'lov turi</th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Izoh</th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(transactions) && transactions.map((transaction) => (
                <motion.tr
                  key={transaction._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}
                >
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {new Date(transaction.date).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className={`px-6 py-4`}>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'income'
                        ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                        : isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'income' ? 'Kirim' : 'Chiqim'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-medium ${
                    transaction.type === 'income'
                      ? isDarkMode ? 'text-green-400' : 'text-green-600'
                      : isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {transaction.amount.toLocaleString()} UZS
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {paymentMethods.find(m => m.value === transaction.payment_method)?.label || transaction.payment_method}
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {transaction.description}
                  </td>
                  <td className={`px-6 py-4`}>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'active'
                        ? isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                        : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.status === 'active' ? 'Faol' : 'Bekor qilingan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenViewDialog(transaction)}
                      className={`p-2 rounded-full ${isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}
                    >
                      <EyeIcon className="h-5 w-5" />
                    </motion.button>

                    {transaction.status === 'active' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenEditDialog(transaction)}
                          className={`p-2 rounded-full ${isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-yellow-600 hover:bg-gray-100'}`}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenDeleteDialog(transaction)}
                          className={`p-2 rounded-full ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={`px-6 py-4 flex items-center justify-between border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              Jami {pagination.total} ta tranzaksiya
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  pagination.currentPage === 1
                    ? isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Oldingi
              </button>
              <div className={`px-3 py-1 rounded-md ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                {pagination.currentPage} / {pagination.totalPages}
              </div>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 rounded-md ${
                  pagination.currentPage === pagination.totalPages
                    ? isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Keyingi
              </button>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <TransactionDialog
          isOpen={openCreateDialog || openEditDialog}
          isCreateMode={openCreateDialog}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={openCreateDialog ? handleCreate : handleUpdate}
          handleClose={handleCloseDialog}
          isDarkMode={isDarkMode}
          categories={categories}
          paymentMethods={paymentMethods}
          dialogVariants={dialogVariants}
        />

        <ViewDialog
          isOpen={openViewDialog}
          transaction={currentTransaction}
          handleClose={handleCloseDialog}
          isDarkMode={isDarkMode}
          paymentMethods={paymentMethods}
          dialogVariants={dialogVariants}
        />

        <DeleteDialog
          isOpen={openDeleteDialog}
          handleDelete={handleDelete}
          handleClose={handleCloseDialog}
          isDarkMode={isDarkMode}
          dialogVariants={dialogVariants}
        />

        {/* Snackbar */}
        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${snackbar.severity === 'success'
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
    </div>
  );
} 