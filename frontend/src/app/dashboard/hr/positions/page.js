'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Switch from '@mui/material/Switch';

export default function PositionsManagement() {
    const { user, token } = useAuth();
    const { isDarkMode } = useTheme();
    const [positions, setPositions] = useState([]);
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
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active',
    });

    useEffect(() => {
        if (token) {
            fetchPositions();
        }
    }, [token, pagination.currentPage, filters]);

    const fetchPositions = async () => {
        try {
            const queryParams = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                search: filters.search,
                status: filters.status,
                sort_by: filters.sortBy,
                sort_order: filters.sortOrder
            });

            const response = await fetch(`http://localhost:5000/api/positions?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                setPositions(result.data || []);
                setPagination({
                    ...pagination,
                    total: result.pagination?.total || result.data.length,
                    totalPages: result.pagination?.total_pages || 1,
                    currentPage: result.pagination?.page || 1,
                    limit: result.pagination?.limit || 10
                });
            } else {
                setError(result.message || 'Lavozimlarni yuklab boʻlmadi');
            }
        } catch (err) {
            setError('Lavozimlarni yuklab boʻlmadi');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateDialog = () => {
        setCurrentPosition(null);
        setFormData({
            name: '',
            description: '',
            status: 'active',
        });
        setOpenCreateDialog(true);
    };

    const handleOpenEditDialog = (position) => {
        setCurrentPosition(position);
        setFormData({
            name: position.name,
            description: position.description,
            status: position.status,
        });
        setOpenEditDialog(true);
    };

    const handleOpenViewDialog = (position) => {
        setCurrentPosition(position);
        setOpenViewDialog(true);
    };

    const handleOpenDeleteDialog = (position) => {
        setCurrentPosition(position);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenCreateDialog(false);
        setOpenEditDialog(false);
        setOpenViewDialog(false);
        setOpenDeleteDialog(false);
        setCurrentPosition(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = async (position) => {
        try {
            const newStatus = position.status === 'active' ? 'inactive' : 'active';
            const response = await fetch(`http://localhost:5000/api/positions/${position.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: 'Lavozim holati muvaffaqiyatli yangilandi',
                    severity: 'success',
                });
                fetchPositions();
            } else {
                throw new Error(result.message || 'Holatni yangilab boʻlmadi');
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Holatni yangilab boʻlmadi',
                severity: 'error',
            });
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            if (!formData.name) {
                throw new Error('Sarlavha kiritilishi shart');
            }

            const response = await fetch('http://localhost:5000/api/positions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    status: formData.status
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: 'Lavozim muvaffaqiyatli yaratildi',
                    severity: 'success',
                });
                fetchPositions();
                handleCloseDialog();
            } else {
                throw new Error(result.message || 'Lavozim yaratib boʻlmadi');
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
            if (!formData.name) {
                throw new Error('Sarlavha kiritilishi shart');
            }

            const response = await fetch(`http://localhost:5000/api/positions/${currentPosition.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    status: formData.status
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: 'Lavozim muvaffaqiyatli yangilandi',
                    severity: 'success',
                });
                fetchPositions();
                handleCloseDialog();
            } else {
                throw new Error(result.message || 'Lavozimni yangilab boʻlmadi');
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
        try {
            const response = await fetch(`http://localhost:5000/api/positions/${currentPosition.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: 'Lavozim muvaffaqiyatli oʻchirildi',
                    severity: 'success',
                });
                fetchPositions();
                handleCloseDialog();
            } else {
                throw new Error(result.message || 'Lavozimni oʻchirib boʻlmadi');
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Xatolik yuz berdi',
                severity: 'error',
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const dialogVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
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
            <div className="max-w-8xl container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                        Lavozimlar Boshqaruvi
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenCreateDialog}
                        className={`flex items-center px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                    >
                        Lavozim Qoʻshish
                    </motion.button>
                </div>

                <div className={`rounded-xl shadow-lg overflow-hidden backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/80 border border-gray-200/50'}`}>
                    <table className="w-full">
                        <thead>
                            <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sarlavha</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tavsif</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Holati</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Harakatlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positions.map((position) => (
                                <motion.tr
                                    key={position.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}
                                >
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{position.name}</td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{position.description}</td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={position.status === 'active'}
                                                onChange={() => handleStatusChange(position)}
                                                color="warning"
                                            />
                                            <span>{position.status === 'active' ? 'Faol' : 'Nofaol'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenViewDialog(position)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenEditDialog(position)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-yellow-600 hover:bg-gray-100'}`}
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenDeleteDialog(position)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
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
                            Jami {pagination.total} ta lavozim
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

                {/* Create Position Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openCreateDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openCreateDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Yangi Lavozim Yaratish
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Sarlavha
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Lavozim sarlavhasini kiriting"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Tavsif
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Lavozim tavsifini kiriting (ixtiyoriy)"
                                    rows="4"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseDialog}
                                    className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                                >
                                    Bekor Qilish
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className={`px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                                >
                                    Yaratish
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Edit Position Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openEditDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openEditDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Lavozimni Tahrirlash
                        </h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Sarlavha
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Lavozim sarlavhasini kiriting"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Tavsif
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Lavozim tavsifini kiriting (ixtiyoriy)"
                                    rows="4"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseDialog}
                                    className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                                >
                                    Bekor Qilish
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className={`px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                                >
                                    Yangilash
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* View Position Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openViewDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openViewDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Lavozim Tafsilotlari
                        </h2>
                        {currentPosition && (
                            <div className="space-y-3">
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Sarlavha:</span> {currentPosition.name}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Tavsif:</span> {currentPosition.description}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Holati:</span> {currentPosition.status === 'active' ? 'Faol' : 'Nofaol'}
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

                {/* Delete Confirmation Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openDeleteDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openDeleteDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Oʻchirishni Tasdiqlash
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-medium">{currentPosition?.name}</span> lavozimini oʻchirishni istaysizmi? Bu amalni qaytarib boʻlmaydi.
                        </p>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={handleCloseDialog}
                                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                            >
                                Bekor Qilish
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDelete}
                                className={`px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}`}
                            >
                                Oʻchirish
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

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