'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Switch from '@mui/material/Switch';

export default function EmployeeManagement() {
    const { user, token } = useAuth();
    const { isDarkMode } = useTheme();
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
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
        role: '',
        department_id: '',
        position_id: '',
        sort_by: 'created_at',
        sort_order: 'DESC'
    });
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        username: '',
        password: '',
        role: '',
        id_number: '',
        birth_date: '',
        hire_date: '',
        address: '',
        department_id: '',
        position_id: '',
        status: 'active'
    });

    useEffect(() => {
        if (token) {
            fetchEmployees();
            fetchDepartments();
            fetchPositions();
            fetchUserTypes();
        }
    }, [token, pagination.currentPage, filters]);

    const fetchEmployees = async () => {
        try {
            const queryParams = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                search: filters.search,
                status: filters.status,
                role: filters.role,
                department_id: filters.department_id,
                position_id: filters.position_id
            });

            const response = await fetch(`http://localhost:5000/api/employees?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                setEmployees(result.data || []);
                setPagination({
                    ...pagination,
                    total: result.pagination?.total || 0,
                    totalPages: result.pagination?.total_pages || 1,
                    currentPage: result.pagination?.page || 1,
                    limit: result.pagination?.limit || 10
                });
            } else {
                setError(result.message || 'Xodimlarni yuklashda xatolik');
            }
        } catch (err) {
            setError('Xodimlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/departments', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setDepartments(result.data || []);
            } else {
                setError(result.message || 'Bo\'limlarni yuklashda xatolik');
            }
        } catch (err) {
            setError('Bo\'limlarni yuklashda xatolik');
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/positions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setPositions(result.data || []);
            } else {
                setError(result.message || 'Lavozimlarni yuklashda xatolik');
            }
        } catch (err) {
            setError('Lavozimlarni yuklashda xatolik');
        }
    };

    const fetchUserTypes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/user-types', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Filter out super_admin and map to correct field names
                const filteredTypes = (result.data || [])
                    .filter(type => type.name !== 'super_admin')
                    .map(type => ({
                        id: type.id,
                        name: type.name,
                        display_name: type.display_name || type.name
                    }));
                setUserTypes(filteredTypes);
            } else {
                console.error('Foydalanuvchi turlarini yuklashda xatolik:', result.message);
                setUserTypes([]);
            }
        } catch (err) {
            console.error('Foydalanuvchi turlarini yuklashda xatolik:', err);
            setUserTypes([]);
        }
    };

    const handleOpenCreateDialog = () => {
        setCurrentEmployee(null);
        setFormData({
            first_name: '',
            last_name: '',
            phone: '',
            username: '',
            password: '',
            role: '',
            id_number: '',
            birth_date: '',
            hire_date: '',
            address: '',
            department_id: '',
            position_id: '',
            status: 'active'
        });
        setOpenCreateDialog(true);
    };

    const handleOpenEditDialog = (employee) => {
        setCurrentEmployee(employee);
        setFormData({
            first_name: employee.first_name,
            last_name: employee.last_name,
            phone: employee.phone,
            username: employee.username,
            password: '', // Password is empty for edit
            role: employee.role?.name || '',
            id_number: employee.id_number,
            birth_date: employee.birth_date?.split('T')[0] || '',
            hire_date: employee.hire_date?.split('T')[0] || '',
            address: employee.address,
            department_id: employee.department_id?._id || '',
            position_id: employee.position_id?._id || '',
            status: employee.status || 'active'
        });
        setOpenEditDialog(true);
    };

    const handleOpenViewDialog = (employee) => {
        setCurrentEmployee(employee);
        setOpenViewDialog(true);
    };

    const handleOpenDeleteDialog = (employee) => {
        setCurrentEmployee(employee);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenCreateDialog(false);
        setOpenEditDialog(false);
        setOpenViewDialog(false);
        setOpenDeleteDialog(false);
        setCurrentEmployee(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = async (employee) => {
        try {
            const newStatus = employee.status === 'active' ? 'inactive' : 'active';
            const response = await fetch(`http://localhost:5000/api/employees/${employee.id}/status`, {
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
                    message: 'Xodim holati muvaffaqiyatli yangilandi',
                    severity: 'success',
                });
                fetchEmployees();
            } else {
                throw new Error(result.message || 'Holatni yangilashda xatolik');
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Holatni yangilashda xatolik',
                severity: 'error',
            });
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: 'Xodim muvaffaqiyatli qo\'shildi',
                    severity: 'success',
                });
                handleCloseDialog();
                fetchEmployees();
            } else {
                setSnackbar({
                    open: true,
                    message: result.message || 'Xodim qo\'shishda xatolik',
                    severity: 'error',
                });
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Xodim qo\'shishda xatolik',
                severity: 'error',
            });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/employees/${currentEmployee.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    username: formData.username,
                    ...(formData.password && { password: formData.password }),
                    role: formData.role,
                    id_number: formData.id_number,
                    birth_date: formData.birth_date,
                    hire_date: formData.hire_date,
                    address: formData.address,
                    department_id: formData.department_id,
                    position_id: formData.position_id,
                    status: formData.status
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || 'Xodim muvaffaqiyatli yangilandi',
                    severity: 'success',
                });
                handleCloseDialog();
                fetchEmployees();
            } else {
                setSnackbar({
                    open: true,
                    message: result.message || 'Xodimni yangilashda xatolik',
                    severity: 'error',
                });
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Xodimni yangilashda xatolik',
                severity: 'error',
            });
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/employees/${currentEmployee.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: 'Xodim muvaffaqiyatli o\'chirildi',
                    severity: 'success',
                });
                fetchEmployees();
                handleCloseDialog();
            } else {
                throw new Error(result.message || 'Xodimni o\'chirishda xatolik');
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
        <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className="max-w-8xl container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                        Xodimlar Boshqaruvi
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenCreateDialog}
                        className={`flex items-center px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                    >
                        Xodim Qo'shish
                    </motion.button>
                </div>

                <div className={`rounded-xl shadow-lg overflow-hidden backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/80 border border-gray-200/50'}`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        F.I.O
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Telefon
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lavozim
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bo'lim
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Holat
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amallar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-gray-200 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                {employees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium">
                                                {employee.first_name} {employee.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {employee.username}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">{employee.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">{employee.position_id?.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">{employee.department_id?.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Switch
                                                checked={employee.status === 'active'}
                                                onChange={() => handleStatusChange(employee)}
                                                color="primary"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleOpenViewDialog(employee)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEditDialog(employee)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenDeleteDialog(employee)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={`px-6 py-4 flex items-center justify-between border-t ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                            Jami {pagination.total} ta xodim
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

                {/* Create Employee Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openCreateDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openCreateDialog && 'hidden'}`}
                    style={{
                        maxHeight: '100vh',
                        overflow: 'auto'
                    }}
                >
                    <div className={`rounded-xl p-4 md:p-6 lg:p-8 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}
                        style={{
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div className="flex justify-between items-center mb-4 md:mb-6 lg:mb-8">
                            <h2 className={`text-xl md:text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                                Yangi Xodim Qo'shish
                            </h2>
                            <button
                                onClick={handleCloseDialog}
                                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {/* Shaxsiy Ma'lumotlar */}
                                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} shadow-lg`}>
                                    <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-yellow-400' : 'text-gray-800'} flex items-center gap-2`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Shaxsiy Ma'lumotlar
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Ism
                                            </label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Ismni kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Familiya
                                            </label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Familiyani kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                ID Raqami
                                            </label>
                                            <input
                                                type="text"
                                                name="id_number"
                                                value={formData.id_number}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="ID raqamini kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Tug'ilgan Sana
                                            </label>
                                            <input
                                                type="date"
                                                name="birth_date"
                                                value={formData.birth_date}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Manzil
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Manzilni kiriting"
                                                rows="3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Ish Ma'lumotlari */}
                                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} shadow-lg`}>
                                    <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-yellow-400' : 'text-gray-800'} flex items-center gap-2`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Ish Ma'lumotlari
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Ishga Qabul Qilingan Sana
                                            </label>
                                            <input
                                                type="date"
                                                name="hire_date"
                                                value={formData.hire_date}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Bo'lim
                                            </label>
                                            <select
                                                name="department_id"
                                                value={formData.department_id}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            >
                                                <option value="">Bo'limni tanlang</option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Lavozim
                                            </label>
                                            <select
                                                name="position_id"
                                                value={formData.position_id}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            >
                                                <option value="">Lavozimni tanlang</option>
                                                {positions.map((pos) => (
                                                    <option key={pos.id} value={pos.id} className="py-2">
                                                        {pos.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Tizim Ma'lumotlari */}
                                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} shadow-lg`}>
                                    <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-yellow-400' : 'text-gray-800'} flex items-center gap-2`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Tizim Ma'lumotlari
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Telefon
                                            </label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Telefon raqamini kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Login
                                            </label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Login kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Parol
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Parolni kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Rol
                                            </label>
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            >
                                                <option value="">Rolni tanlang</option>
                                                {userTypes.map((type) => (
                                                    <option key={type.id} value={type.name} className="py-2">
                                                        {type.display_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-8">
                                <button
                                    type="button"
                                    onClick={handleCloseDialog}
                                    className={`px-6 py-3 rounded-lg text-lg font-medium ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                                >
                                    Bekor Qilish
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className={`px-6 py-3 rounded-lg text-lg font-medium text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                                >
                                    Yaratish
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Edit Employee Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openEditDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openEditDialog && 'hidden'}`}
                    style={{
                        maxHeight: '100vh',
                        overflow: 'auto'
                    }}
                >
                    <div className={`rounded-xl p-4 md:p-6 lg:p-8 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}
                        style={{
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div className="flex justify-between items-center mb-4 md:mb-6 lg:mb-8">
                            <h2 className={`text-xl md:text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                                Xodimni Tahrirlash
                            </h2>
                            <button
                                onClick={handleCloseDialog}
                                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {/* Shaxsiy Ma'lumotlar */}
                                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} shadow-lg`}>
                                    <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-yellow-400' : 'text-gray-800'} flex items-center gap-2`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Shaxsiy Ma'lumotlar
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Ism
                                            </label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Ismni kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Familiya
                                            </label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Familiyani kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                ID Raqami
                                            </label>
                                            <input
                                                type="text"
                                                name="id_number"
                                                value={formData.id_number}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="ID raqamini kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Tug'ilgan Sana
                                            </label>
                                            <input
                                                type="date"
                                                name="birth_date"
                                                value={formData.birth_date}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Manzil
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Manzilni kiriting"
                                                rows="3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Ish Ma'lumotlari */}
                                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} shadow-lg`}>
                                    <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-yellow-400' : 'text-gray-800'} flex items-center gap-2`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Ish Ma'lumotlari
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Ishga Qabul Qilingan Sana
                                            </label>
                                            <input
                                                type="date"
                                                name="hire_date"
                                                value={formData.hire_date}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Bo'lim
                                            </label>
                                            <select
                                                name="department_id"
                                                value={formData.department_id}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            >
                                                <option value="">Bo'limni tanlang</option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Lavozim
                                            </label>
                                            <select
                                                name="position_id"
                                                value={formData.position_id}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            >
                                                <option value="">Lavozimni tanlang</option>
                                                {positions.map((pos) => (
                                                    <option key={pos.id} value={pos.id} className="py-2">
                                                        {pos.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Tizim Ma'lumotlari */}
                                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} shadow-lg`}>
                                    <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-yellow-400' : 'text-gray-800'} flex items-center gap-2`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Tizim Ma'lumotlari
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Telefon
                                            </label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Telefon raqamini kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Login
                                            </label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Login kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Parol
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Parolni kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Rol
                                            </label>
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            >
                                                <option value="">Rolni tanlang</option>
                                                {userTypes.map((type) => (
                                                    <option key={type.id} value={type.name} className="py-2">
                                                        {type.display_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-8">
                                <button
                                    type="button"
                                    onClick={handleCloseDialog}
                                    className={`px-6 py-3 rounded-lg text-lg font-medium ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                                >
                                    Bekor Qilish
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className={`px-6 py-3 rounded-lg text-lg font-medium text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                                >
                                    Yangilash
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* View Employee Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openViewDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openViewDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Xodim Tafsilotlari
                        </h2>
                        {currentEmployee && (
                            <div className="space-y-3">
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">To'liq Ismi:</span> {`${currentEmployee.first_name} ${currentEmployee.last_name}`}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Telefon:</span> {currentEmployee.phone}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Login:</span> {currentEmployee.username}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Bo'lim:</span> {currentEmployee.department_id?.name || '-'}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Lavozim:</span> {currentEmployee.position_id?.name ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                            {currentEmployee.position_id.name}
                                        </span>
                                    ) : '-'}
                                </p>
                               
                               
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Holati:</span> {currentEmployee.status === 'active' ? 'Faol' : 'Nofaol'}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Rol:</span>{' '}
                                    {userTypes.find(type => type.name === currentEmployee.role?.name)?.display_name || '-'}
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
                            O'chirishni Tasdiqlash
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Siz haqiqatan ham <span className="font-medium">{currentEmployee?.first_name} {currentEmployee?.last_name}</span> xodimini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
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
                                O'chirish
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