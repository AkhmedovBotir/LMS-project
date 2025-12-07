'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { UserIcon, EyeIcon, PencilIcon, LockClosedIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';

export default function AdminManagement() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [admins, setAdmins] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    userTypeId: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    userTypeId: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Token tekshirish funksiyasi
  const checkAuth = () => {
    const token = Cookies.get('token');
    if (!token) {
      window.location.href = '/login';
      return false;
    }
    return token;
  };

  // API so'rovlari uchun umumiy funksiya
  const fetchWithAuth = async (url, options = {}) => {
    const token = checkAuth();
    if (!token) return null;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });

      if (response.status === 401) {
        Cookies.remove('token');
        window.location.href = '/login';
        return null;
      }

      return response;
    } catch (error) {
      console.error('API so\'rovida xatolik:', error);
      throw error;
    }
  };

  useEffect(() => {
    const token = checkAuth();
    if (token) {
      fetchAdmins();
      fetchUserTypes();
    }
  }, [pagination.currentPage, filters]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.userTypeId && { user_type_id: filters.userTypeId }),
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder
      });

      const response = await fetchWithAuth(`http://localhost:5000/api/auth/admins?${queryParams}`);
      if (!response) return;

      const result = await response.json();
      if (result.success) {
        setAdmins(result.data || []);
        setPagination({
          ...pagination,
          total: result.pagination.total,
          totalPages: result.pagination.total_pages
        });
      } else {
        throw new Error(result.message || 'Adminlarni yuklab bo\'lmadi');
      }
    } catch (error) {
      setError(error.message);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTypes = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:5000/api/auth/user-types');
      if (!response) return;

      const result = await response.json();
      if (result.success) {
        setUserTypes(result.data || []);
      } else {
        throw new Error(result.message || 'Foydalanuvchi turlarini yuklab bo\'lmadi');
      }
    } catch (error) {
      setError(error.message);
      setUserTypes([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!formData.username || !formData.password || !formData.firstName ||
        !formData.lastName || !formData.userTypeId) {
        throw new Error('Barcha maydonlar to\'ldirilishi shart');
      }

      const response = await fetchWithAuth('http://localhost:5000/api/auth/admins', {
        method: 'POST',
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
          user_type_id: formData.userTypeId
        })
      });

      if (!response) return;

      const result = await response.json();
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Admin muvaffaqiyatli yaratildi',
          severity: 'success',
        });
        fetchAdmins();
        handleCloseDialog();
      } else {
        throw new Error(result.message || 'Admin yaratishda xatolik yuz berdi');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!currentAdmin?._id) {
        throw new Error('Admin ID topilmadi');
      }

      const response = await fetchWithAuth(`http://localhost:5000/api/auth/admins/${currentAdmin._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          phone: formData.phone,
          user_type_id: formData.userTypeId,
          ...(formData.password ? { password: formData.password } : {})
        })
      });

      if (!response) return;

      const result = await response.json();
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Admin muvaffaqiyatli yangilandi',
          severity: 'success',
        });
        fetchAdmins();
        handleCloseDialog();
      } else {
        throw new Error(result.message || 'Admin yangilashda xatolik yuz berdi');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!currentAdmin?._id) {
        throw new Error('Admin ID topilmadi');
      }

      const response = await fetchWithAuth(`http://localhost:5000/api/auth/admins/${currentAdmin._id}`, {
        method: 'DELETE'
      });

      if (!response) return;

      const result = await response.json();
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Admin muvaffaqiyatli o\'chirildi',
          severity: 'success',
        });
        fetchAdmins();
        handleCloseDialog();
      } else {
        throw new Error(result.message || 'Admin o\'chirishda xatolik yuz berdi');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetchWithAuth(`http://localhost:5000/api/auth/admins/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response) return;

      const result = await response.json();
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Admin statusi muvaffaqiyatli yangilandi',
          severity: 'success',
        });
        fetchAdmins();
      } else {
        throw new Error(result.message || 'Admin statusini yangilashda xatolik yuz berdi');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
    setOpenPasswordDialog(false);
    setOpenViewDialog(false);
    setOpenDeleteDialog(false);
    setCurrentAdmin(null);
    setFormData({
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      userTypeId: '',
    });
  };

  const handleOpenEdit = async (admin) => {
    try {
      const response = await fetchWithAuth(`http://localhost:5000/api/auth/admins/${admin._id}`);
      if (!response) return;

      const result = await response.json();
      if (result.success) {
        const adminData = result.data;
        setFormData({
          username: adminData.username,
          firstName: adminData.first_name,
          lastName: adminData.last_name,
          phone: adminData.phone || '',
          userTypeId: adminData.user_type_id._id,
          password: ''
        });
        setCurrentAdmin(adminData);
        setOpenEditDialog(true);
      } else {
        throw new Error(result.message || 'Admin ma\'lumotlarini yuklab bo\'lmadi');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Xatolik yuz berdi',
        severity: 'error',
      });
    }
  };

  const handleOpenCreateDialog = () => {
    setCurrentAdmin(null);
    setFormData({
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      userTypeId: userTypes.length > 0 ? userTypes[0].id : '',
    });
    setOpenCreateDialog(true);
  };

  const handleOpenViewDialog = (admin) => {
    setCurrentAdmin(admin);
    setOpenViewDialog(true);
  };

  const handleOpenPasswordDialog = (admin) => {
    setCurrentAdmin(admin);
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
    });
    setOpenPasswordDialog(true);
  };

  const handleOpenDeleteDialog = (admin) => {
    setCurrentAdmin(admin);
    setOpenDeleteDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Parollar mos kelmadi',
        severity: 'error',
      });
      return;
    }

    try {
      const token = checkAuth();
      const response = await fetch(`http://localhost:5000/api/auth/admin/${currentAdmin._id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_password: passwordData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Parol muvaffaqiyatli yangilandi',
          severity: 'success',
        });
        handleCloseDialog();
      } else {
        throw new Error(data.message || 'Parolni yangilashda xatolik');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Parolni yangilashda xatolik',
        severity: 'error',
      });
    }
  };

  // Add pagination controls
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Add filter controls
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page when filters change
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Dialog animatsiyalari
  const dialogVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={`text-lg font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-8xxl container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
            Admin Boshqaruvi
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenCreateDialog}
            className={`flex items-center px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
              } transition-colors duration-200`}
          >
            <UserIcon className="h-5 w-5 mr-2" />
            Admin Qo'shish
          </motion.button>
        </div>

        <div className={`rounded-xl shadow-lg overflow-hidden backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/80 border border-gray-200/50'
          }`}>
          <table className="w-full">
            <thead>
              <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Foydalanuvchi nomi</th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ism</th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Telefon</th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Foydalanuvchi turi</th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(admins) && admins.map((admin) => (
                <motion.tr
                  key={admin._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}
                >
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{admin.username}</td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{`${admin.first_name} ${admin.last_name}`}</td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{admin.phone || '-'}</td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{admin.user_type_id?.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleStatusChange(admin._id, admin.status === 'active' ? 'inactive' : 'active')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          admin.status === 'active'
                            ? isDarkMode
                              ? 'bg-green-600 focus:ring-green-500'
                              : 'bg-green-500 focus:ring-green-400'
                            : isDarkMode
                            ? 'bg-gray-600 focus:ring-gray-500'
                            : 'bg-gray-300 focus:ring-gray-400'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            admin.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {admin.status === 'active' ? 'Faol' : 'Nofaol'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenViewDialog(admin)}
                      className={`p-2 rounded-full ${isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}
                    >
                      <EyeIcon className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenEdit(admin)}
                      disabled={admin.user_type_id?.name === 'super_admin'}
                      className={`p-2 rounded-full ${isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-yellow-600 hover:bg-gray-100'} ${admin.user_type_id?.name === 'super_admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenPasswordDialog(admin)}
                      disabled={admin.user_type_id?.name === 'super_admin'}
                      className={`p-2 rounded-full ${isDarkMode ? 'text-purple-400 hover:bg-gray-700' : 'text-purple-600 hover:bg-gray-100'} ${admin.user_type_id?.name === 'super_admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <LockClosedIcon className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenDeleteDialog(admin)}
                      disabled={admin.user_type_id?.name === 'super_admin'}
                      className={`p-2 rounded-full ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'} ${admin.user_type_id?.name === 'super_admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </motion.button>
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
              Jami {pagination.total} ta admin
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

        {/* Yangi Admin Qo'shish Dialogi */}
        <motion.div
          variants={dialogVariants}
          initial="hidden"
          animate={openCreateDialog ? "visible" : "hidden"}
          exit="exit"
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openCreateDialog && 'hidden'}`}
        >
          <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
              Yangi Admin Qo'shish
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Foydalanuvchi nomi
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Foydalanuvchi nomini kiriting"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Parol
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Parolni kiriting"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ism
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Ismni kiriting"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Familiya
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Familiyani kiriting"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Telefon raqami
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Telefon raqamini kiriting"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Foydalanuvchi turi
                </label>
                <select
                  name="userTypeId"
                  value={formData.userTypeId}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                  <option value="">Foydalanuvchi turini tanlang</option>
                  {Array.isArray(userTypes) && userTypes.length > 0 ? (
                    userTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Foydalanuvchi turlari mavjud emas</option>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseDialog}
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
                  Yaratish
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Adminni Tahrirlash Dialogi */}
        <motion.div
          variants={dialogVariants}
          initial="hidden"
          animate={openEditDialog ? "visible" : "hidden"}
          exit="exit"
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openEditDialog && 'hidden'}`}
        >
          <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
              Adminni Tahrirlash
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Foydalanuvchi nomi
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50`}
                  placeholder="Foydalanuvchi nomini kiriting"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ism
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Ismni kiriting"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Familiya
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Familiyani kiriting"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Telefon raqami
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Telefon raqamini kiriting"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Foydalanuvchi turi
                </label>
                <select
                  name="userTypeId"
                  value={formData.userTypeId}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                  <option value="">Foydalanuvchi turini tanlang</option>
                  {Array.isArray(userTypes) && userTypes.length > 0 ? (
                    userTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Foydalanuvchi turlari mavjud emas</option>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseDialog}
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
                  Yangilash
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Admin Ma'lumotlari Dialogi */}
        <motion.div
          variants={dialogVariants}
          initial="hidden"
          animate={openViewDialog ? "visible" : "hidden"}
          exit="exit"
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openViewDialog && 'hidden'}`}
        >
          <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
              Admin Ma'lumotlari
            </h2>
            {currentAdmin && (
              <div className="space-y-3">
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Foydalanuvchi nomi:</span> {currentAdmin.username}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Ism:</span> {currentAdmin.first_name} {currentAdmin.last_name}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Telefon:</span> {currentAdmin.phone || '-'}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Foydalanuvchi turi:</span> {currentAdmin.user_type_id?.name}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Status:</span> {currentAdmin.status === 'active' ? 'Faol' : 'Nofaol'}
                </p>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseDialog}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Yopish
              </button>
            </div>
          </div>
        </motion.div>

        {/* Parolni O'zgartirish Dialogi */}
        <motion.div
          variants={dialogVariants}
          initial="hidden"
          animate={openPasswordDialog ? "visible" : "hidden"}
          exit="exit"
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openPasswordDialog && 'hidden'}`}
        >
          <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
              Parolni O'zgartirish
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Yangi Parol
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Yangi parolni kiriting"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Parolni Tasdiqlash
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Parolni qayta kiriting"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseDialog}
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
                  Parolni Yangilash
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* O'chirish Tasdiqlash Dialogi */}
        <motion.div
          variants={dialogVariants}
          initial="hidden"
          animate={openDeleteDialog ? "visible" : "hidden"}
          exit="exit"
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openDeleteDialog && 'hidden'}`}
        >
          <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
              O'chirishni Tasdiqlash
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Siz haqiqatan ham <span className="font-medium">{currentAdmin?.username}</span> adminini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleCloseDialog}
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

        {/* Xabar Qutisi */}
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