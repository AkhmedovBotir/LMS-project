'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { EyeIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Switch from '@mui/material/Switch';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    Pagination,
    IconButton,
    InputAdornment,
    Tabs,
    Tab,
    TabPanel
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function StudentManagement() {
    const { user, token } = useAuth();
    const { isDarkMode } = useTheme();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });

    // Form state for student
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        birth_date: '',
        address: '',
        parent_name: '',
        parent_phone: '',
        gender: 'male',
        status: 'active',
        payment_status: 'trial',
        trial_lesson_date: '',
        joined_date: ''
    });

    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        gender: '',
        payment_status: '',
        start_date: '',
        end_date: '',
    });
    const [sort, setSort] = useState({
        sort_by: 'created_at',
        sort_order: 'DESC',
    });

    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (token) {
            fetchStudents();
        }
    }, [token, pagination.currentPage, search, filters, sort]);

    // Handle search form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Prevent form submission and page reload
        setSearch(searchTerm);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            if (!token) {
                setError('Authentication required');
                return;
            }
            const params = {
                page: pagination.currentPage,
                limit: pagination.limit,
                search,
                ...filters,
                ...sort,
            };
            // Remove empty params
            Object.keys(params).forEach((k) => (params[k] === '' ? delete params[k] : null));
            const response = await axios.get('http://localhost:5000/api/students', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params,
            });
            if (response.data.success) {
                setStudents(response.data.data || []);
                if (response.data.pagination) {
                    setPagination({
                        ...pagination,
                        total: response.data.pagination.total || 0,
                        totalPages: response.data.pagination.total_pages || 1,
                        currentPage: response.data.pagination.page || 1
                    });
                }
            } else {
                setError(response.data.message || 'O\'quvchilarni yuklab bo\'lmadi');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Authentication required');
            } else {
                setError(err.response?.data?.message || 'O\'quvchilarni yuklab bo\'lmadi');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateDialog = () => {
        setCurrentStudent(null);
        setFormData({
            first_name: '',
            last_name: '',
            phone: '',
            password: '',
            birth_date: '',
            address: '',
            parent_name: '',
            parent_phone: '',
            gender: 'male',
            status: 'active',
            payment_status: 'trial',
            trial_lesson_date: '',
            joined_date: ''
        });
        setOpenCreateDialog(true);
    };

    const handleOpenEditDialog = (student) => {
        setCurrentStudent(student);
        setFormData({
            first_name: student.first_name,
            last_name: student.last_name,
            phone: student.phone,
            password: '',
            birth_date: student.birth_date ? new Date(student.birth_date).toISOString().split('T')[0] : '',
            address: student.address || '',
            parent_name: student.parent_name || '',
            parent_phone: student.parent_phone || '',
            gender: student.gender,
            status: student.status,
            payment_status: student.payment_status,
            trial_lesson_date: student.trial_lesson_date ? new Date(student.trial_lesson_date).toISOString().split('T')[0] : '',
            joined_date: student.joined_date ? new Date(student.joined_date).toISOString().split('T')[0] : ''
        });
        setOpenEditDialog(true);
    };

    const handleOpenViewDialog = (student) => {
        setCurrentStudent(student);
        setOpenViewDialog(true);
    };

    const handleOpenDeleteDialog = (student) => {
        setCurrentStudent(student);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenCreateDialog(false);
        setOpenEditDialog(false);
        setOpenViewDialog(false);
        setOpenDeleteDialog(false);
        setCurrentStudent(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreate = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                setError('Authentication required');
                return;
            }

            // Validate required fields
            if (!formData.first_name || !formData.last_name || !formData.phone || !formData.password || !formData.gender || !formData.joined_date) {
                setSnackbar({
                    open: true,
                    message: 'Barcha majburiy maydonlarni to\'ldiring',
                    severity: 'error'
                });
                return;
            }

            // Format dates
            const formattedData = {
                ...formData,
                birth_date: formData.birth_date ? new Date(formData.birth_date).toISOString() : undefined,
                trial_lesson_date: formData.trial_lesson_date ? new Date(formData.trial_lesson_date).toISOString() : undefined,
                created_at: new Date().toISOString(),
                joined_date: new Date(formData.joined_date).toISOString()
            };

            const response = await axios.post('http://localhost:5000/api/students', formattedData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setSnackbar({
                    open: true,
                    message: 'O\'quvchi muvaffaqiyatli qo\'shildi',
                    severity: 'success'
                });
                setOpenCreateDialog(false);
                fetchStudents();
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'O\'quvchi qo\'shishda xatolik yuz berdi',
                severity: 'error'
            });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Validate required fields
            if (!formData.first_name || !formData.last_name || !formData.phone || !formData.gender) {
                setSnackbar({
                    open: true,
                    message: 'Ism, familiya, telefon va jins maydonlari to\'ldirilishi shart',
                    severity: 'error'
                });
                return;
            }

            setLoading(true);
            setError(null);
            const token = Cookies.get('token');
            if (!token) {
                setError('Authentication required');
                return;
            }
            const response = await axios.patch(
                `http://localhost:5000/api/students/${currentStudent._id || currentStudent.id}`,
                {
                    ...formData,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.data.success) {
                setSnackbar({
                    open: true,
                    message: response.data.message || 'Talaba muvaffaqiyatli yangilandi',
                    severity: 'success'
                });
                handleCloseDialog();
                fetchStudents();
            } else {
                setSnackbar({
                    open: true,
                    message: response.data.message || 'Talaba yangilashda xatolik yuz berdi',
                    severity: 'error'
                });
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setSnackbar({
                    open: true,
                    message: 'Authentication required',
                    severity: 'error'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: error.response?.data?.message || 'O\'quvchi yangilashda xatolik yuz berdi',
                    severity: 'error'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = Cookies.get('token');
            if (!token) {
                setError('Authentication required');
                return;
            }
            const response = await axios.delete(
                `http://localhost:5000/api/students/${currentStudent._id || currentStudent.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.data.success) {
                setSnackbar({
                    open: true,
                    message: response.data.message || 'Talaba muvaffaqiyatli o\'chirildi',
                    severity: 'success'
                });
                handleCloseDialog();
                fetchStudents();
            } else {
                setError(response.data.message || 'Talaba o\'chirishda xatolik yuz berdi');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setError('Authentication required');
            } else {
                setError(error.response?.data?.message || 'O\'quvchini o\'chirishda xatolik yuz berdi');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handlePageChange = (event, value) => {
        if (typeof value === 'number' && value >= 1 && value <= pagination.totalPages && value !== pagination.currentPage) {
            setPagination(prev => ({ ...prev, currentPage: value }));
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleSortChange = (e) => {
        const { name, value } = e.target;
        setSort((prev) => ({ ...prev, [name]: value }));
    };

    const handleLimitChange = (e) => {
        setPagination((prev) => ({ ...prev, limit: Number(e.target.value), currentPage: 1 }));
    };

    // Dialoglar uchun animatsiya variantlari
    const dialogVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
    };

    // Sahifalash uchun massiv hosil qiluvchi funksiya
    function getPaginationRange(current, total) {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <svg
                    className="animate-spin h-8 w-8 text-yellow-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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
                {/* Sarlavha va yangi talaba qo'shish tugmasi */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                        Talabalar Boshqaruvi
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenCreateDialog}
                        className={`flex items-center px-4 py-2 rounded-lg text-white ${
                            isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
                        }`}
                    >
                        Talaba Qo'shish
                    </motion.button>
                </div>

                {/* Qidiruv va filtrlash */}
                <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Qidiruv */}
                        <form onSubmit={handleSearchSubmit} className="w-full">
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Qidirish
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Ism, familiya, telefon..."
                                    className={`w-full px-3 py-2 rounded-lg border ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                />
                                <button 
                                    type="submit" 
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-500 focus:outline-none"
                                >
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </form>

                        {/* Holat */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Holati
                            </label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                            >
                                <option value="">Barchasi</option>
                                <option value="active">Faol</option>
                                <option value="graduated">Bitirgan</option>
                                <option value="expelled">Haydalgan</option>
                                <option value="fail">Muvaffaqiyatsiz</option>
                            </select>
                        </div>

                        {/* Jins */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Jins
                            </label>
                            <select
                                name="gender"
                                value={filters.gender}
                                onChange={handleFilterChange}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                            >
                                <option value="">Barchasi</option>
                                <option value="male">Erkak</option>
                                <option value="female">Ayol</option>
                            </select>
                        </div>

                        {/* To'lov holati */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                To'lov holati
                            </label>
                            <select
                                name="payment_status"
                                value={filters.payment_status}
                                onChange={handleFilterChange}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                            >
                                <option value="">Barchasi</option>
                                <option value="trial">Sinov darsi</option>
                                <option value="paid">To'langan</option>
                                <option value="expired">Muddati o'tgan</option>
                                <option value="unpaid">To'lanmagan</option>
                            </select>
                        </div>
                    </div>

                    {/* Sana oralig'i */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Boshlanish sanasi
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={filters.start_date}
                                onChange={handleFilterChange}
                                className={`w-full px-3 py-2 rounded-lg border ${
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
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                            />
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex justify-end mt-4 space-x-2">
                        <button
                            onClick={() => {
                                setSearch('');
                                setFilters({
                                    status: '',
                                    gender: '',
                                    payment_status: '',
                                    start_date: '',
                                    end_date: ''
                                });
                            }}
                            className={`px-4 py-2 rounded-lg ${
                                isDarkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                            }`}
                        >
                            Tozalash
                        </button>
                        <button
                            onClick={() => {
                                setPagination(prev => ({ ...prev, page: 1 }));
                                fetchStudents();
                            }}
                            className={`px-4 py-2 rounded-lg text-white ${
                                isDarkMode 
                                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                                    : 'bg-yellow-500 hover:bg-yellow-600'
                            }`}
                        >
                            Qo'llash
                        </button>
                    </div>
                </div>

                {/* Talabalar Jadvali */}
                <div className={`rounded-xl shadow-lg overflow-hidden backdrop-blur-sm ${
                    isDarkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/80 border border-gray-200/50'
                }`}>
                    <table className="w-full">
                        <thead>
                            <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Ism
                                </th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Telefon
                                </th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Tug'ilgan sana
                                </th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Jins
                                </th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Guruh
                                </th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Holati
                                </th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    To'lov holati
                                </th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Keyingi to'lov
                                </th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Kelgan sanasi
                                </th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Harakatlar
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {students.map((student) => (
                                <motion.tr
                                    key={student._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`${
                                        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                                    } transition-colors duration-200`}
                                >
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {student.first_name} {student.last_name}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {student.phone}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {student.birth_date ? new Date(student.birth_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {student.gender === 'male' ? 'Erkak' : 'Ayol'}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {student.group_students && student.group_students.length > 0 ? (
                                            <div className="space-y-1">
                                                {student.group_students.map((group) => (
                                                    <div key={group._id} className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            group.status === 'active' 
                                                                ? isDarkMode 
                                                                    ? 'bg-green-500/20 text-green-400' 
                                                                    : 'bg-green-100 text-green-800'
                                                                : isDarkMode 
                                                                    ? 'bg-gray-500/20 text-gray-400' 
                                                                    : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {group.group_id.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                isDarkMode 
                                                    ? 'bg-gray-500/20 text-gray-400' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                Guruh yo'q
                                            </span>
                                        )}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            student.status === 'active'
                                                ? isDarkMode
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-green-100 text-green-800'
                                                : isDarkMode
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-red-100 text-red-800'
                                        }`}>
                                            {student.status === 'active' ? 'Faol' : 'Nofaol'}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            student.payment_status === 'paid'
                                                ? isDarkMode
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-green-100 text-green-800'
                                                : student.payment_status === 'trial'
                                                    ? isDarkMode
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    : isDarkMode
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                            {student.payment_status === 'paid' 
                                                ? 'To\'langan' 
                                                : student.payment_status === 'trial' 
                                                    ? 'Sinov darsi' 
                                                    : 'To\'lanmagan'}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {student.next_payment_due
                                            ? new Date(student.next_payment_due).toLocaleDateString() 
                                            : '-'}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {student.joined_date 
                                            ? new Date(student.joined_date).toLocaleDateString() 
                                            : '-'}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        <div className="flex items-center justify-end space-x-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleOpenViewDialog(student)}
                                                className={`p-1 rounded-lg ${
                                                    isDarkMode
                                                        ? 'text-gray-400 hover:text-yellow-500 hover:bg-gray-700/50'
                                                        : 'text-gray-500 hover:text-yellow-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleOpenEditDialog(student)}
                                                className={`p-1 rounded-lg ${
                                                    isDarkMode
                                                        ? 'text-gray-400 hover:text-yellow-500 hover:bg-gray-700/50'
                                                        : 'text-gray-500 hover:text-yellow-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleOpenDeleteDialog(student)}
                                                className={`p-1 rounded-lg ${
                                                    isDarkMode
                                                        ? 'text-gray-400 hover:text-red-500 hover:bg-gray-700/50'
                                                        : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Sahifalash */}
                    <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jami {pagination.total} ta talaba</p>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(null, pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className={`px-3 py-1 rounded-lg text-sm ${
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
                                {getPaginationRange(pagination.currentPage, pagination.totalPages).map((page, idx) => (
                                    page === '...'
                                        ? <span key={idx} className={`px-2 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>...</span>
                                        : <button
                                            key={idx}
                                            onClick={() => handlePageChange(null, page)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                                                page === pagination.currentPage
                                                    ? isDarkMode
                                                        ? 'bg-yellow-600 text-white border-yellow-600'
                                                        : 'bg-yellow-500 text-white border-yellow-500'
                                                    : isDarkMode
                                                        ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                                                        : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                                            }`}
                                            disabled={page === pagination.currentPage}
                                        >
                                            {page}
                                        </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(null, pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className={`px-3 py-1 rounded-lg text-sm ${
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
                </div>

                {/* Create Dialog */}
                {openCreateDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`rounded-xl p-6 w-full max-w-6xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    O'quvchi qo'shish
                                </h2>
                                <button
                                    onClick={() => setOpenCreateDialog(false)}
                                    className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Asosiy ma'lumotlar */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Asosiy ma'lumotlar
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Ism *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Ism"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Familiya *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Familiya"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Telefon *
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="+998XXXXXXXXX"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Parol *
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Parol"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Jins *
                                            </label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            >
                                                <option value="">Jinsni tanlang</option>
                                                <option value="male">Erkak</option>
                                                <option value="female">Ayol</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Tug'ilgan sana
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.birth_date}
                                                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Qo'shilgan sana *
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.joined_date}
                                                onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Qo'shimcha ma'lumotlar */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Qo'shimcha ma'lumotlar
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Manzil
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Manzil"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Ota-ona ismi
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.parent_name}
                                                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Ota-ona ismi"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Ota-ona telefoni
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.parent_phone}
                                                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="+998XXXXXXXXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sinov muddati */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Sinov muddati
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Sinov darsi sanasi
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.trial_lesson_date}
                                                onChange={(e) => setFormData({ ...formData, trial_lesson_date: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setOpenCreateDialog(false)}
                                    className={`px-4 py-2 rounded-lg ${isDarkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                >
                                    Qo'shish
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Dialog */}
                {openEditDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`rounded-xl p-6 w-full max-w-6xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    O'quvchi ma'lumotlarini tahrirlash
                                </h2>
                                <button
                                    onClick={() => setOpenEditDialog(false)}
                                    className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Asosiy ma'lumotlar */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Asosiy ma'lumotlar
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Ism *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Ism"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Familiya *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Familiya"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Telefon *
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="+998XXXXXXXXX"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Parol
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Parol"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Jins *
                                            </label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            >
                                                <option value="">Jinsni tanlang</option>
                                                <option value="male">Erkak</option>
                                                <option value="female">Ayol</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Tug'ilgan sana
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.birth_date}
                                                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Qo'shilgan sana
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.joined_date}
                                                onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Qo'shimcha ma'lumotlar */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Qo'shimcha ma'lumotlar
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Manzil
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Manzil"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Ota-ona ismi
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.parent_name}
                                                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="Ota-ona ismi"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Ota-ona telefoni
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.parent_phone}
                                                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                placeholder="+998XXXXXXXXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Holat va sinov muddati */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Holat va sinov muddati
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Holati *
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            >
                                                <option value="active">Faol</option>
                                                <option value="inactive">Nofaol</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Sinov darsi sanasi
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.trial_lesson_date}
                                                onChange={(e) => setFormData({ ...formData, trial_lesson_date: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setOpenEditDialog(false)}
                                    className={`px-4 py-2 rounded-lg ${isDarkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                >
                                    Saqlash
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Talaba Ma'lumotlari Dialogi */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openViewDialog ? 'visible' : 'hidden'}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${
                        !openViewDialog && 'hidden'
                    }`}
                >
                    <div
                        className={`rounded-xl p-6 w-full max-w-2xl backdrop-blur-lg ${
                            isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'
                        }`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                                Talaba Tafsilotlari
                            </h2>
                            <button
                                onClick={handleCloseDialog}
                                className={`p-2 rounded-lg ${
                                    isDarkMode
                                        ? 'text-gray-400 hover:text-yellow-500 hover:bg-gray-700/50'
                                        : 'text-gray-500 hover:text-yellow-600 hover:bg-gray-100'
                                }`}
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {currentStudent && (
                            <div>
                                <Tabs
                                    value={tabValue}
                                    onChange={(e, newValue) => setTabValue(newValue)}
                                    variant="fullWidth"
                                    sx={{
                                        '& .MuiTabs-indicator': {
                                            backgroundColor: isDarkMode ? '#EAB308' : '#EAB308',
                                        },
                                        '& .MuiTab-root': {
                                            color: isDarkMode ? '#9CA3AF' : '#4B5563',
                                            '&.Mui-selected': {
                                                color: isDarkMode ? '#EAB308' : '#EAB308',
                                            },
                                        },
                                        backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : '#F3F4F6',
                                        borderRadius: '0.75rem',
                                        padding: '0.25rem',
                                    }}
                                >
                                    <Tab label="Asosiy ma'lumotlar" />
                                    <Tab label="Guruh va to'lov" />
                                    <Tab label="Qo'shimcha" />
                                </Tabs>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-6"
                                >
                                    {tabValue === 0 && (
                                        <div className={`rounded-xl p-4 ${
                                            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                        }`}>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Ism va Familiya
                                                    </p>
                                                    <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {currentStudent.first_name} {currentStudent.last_name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Telefon
                                                    </p>
                                                    <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {currentStudent.phone}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Tug'ilgan sana
                                                    </p>
                                                    <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {currentStudent.birth_date ? new Date(currentStudent.birth_date).toLocaleDateString() : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Jins
                                                    </p>
                                                    <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {currentStudent.gender === 'male' ? 'Erkak' : 'Ayol'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {tabValue === 1 && (
                                        <div className={`rounded-xl p-4 ${
                                            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                        }`}>
                                            <div className="space-y-6">
                                                {/* Guruh ma'lumotlari */}
                                                <div>
                                                    <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Guruhlar
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {currentStudent.group_students && currentStudent.group_students.length > 0 ? (
                                                            currentStudent.group_students.map((group) => (
                                                                <div key={group._id} className="flex items-center space-x-2">
                                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                                        group.status === 'active' 
                                                                            ? isDarkMode 
                                                                                ? 'bg-green-500/20 text-green-400' 
                                                                                : 'bg-green-100 text-green-800'
                                                                            : isDarkMode 
                                                                                ? 'bg-gray-500/20 text-gray-400' 
                                                                                : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {group.group_id.name}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-500/20 text-gray-400' 
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                Guruh yo'q
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* To'lov ma'lumotlari */}
                                                <div>
                                                    <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        To'lov ma'lumotlari
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                Holati
                                                            </p>
                                                            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                                                                currentStudent.status === 'active'
                                                                    ? isDarkMode
                                                                        ? 'bg-green-500/20 text-green-400'
                                                                        : 'bg-green-100 text-green-800'
                                                                    : isDarkMode
                                                                        ? 'bg-red-500/20 text-red-400'
                                                                        : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {currentStudent.status === 'active' ? 'Faol' : 'Nofaol'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                To'lov holati
                                                            </p>
                                                            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                                                                currentStudent.payment_status === 'paid'
                                                                    ? isDarkMode
                                                                        ? 'bg-green-500/20 text-green-400'
                                                                        : 'bg-green-100 text-green-800'
                                                                    : currentStudent.payment_status === 'trial'
                                                                        ? isDarkMode
                                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                        : isDarkMode
                                                                            ? 'bg-red-500/20 text-red-400'
                                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {currentStudent.payment_status === 'paid' 
                                                                    ? 'To\'langan' 
                                                                    : currentStudent.payment_status === 'trial' 
                                                                        ? 'Sinov darsi' 
                                                                        : 'To\'lanmagan'}
                                                            </span>
                                                        </div>
                                                        {currentStudent.last_payment_date && (
                                                            <div>
                                                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                    Oxirgi to'lov sanasi
                                                                </p>
                                                                <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                                    {new Date(currentStudent.last_payment_date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {currentStudent.trial_lesson_date && (
                                                            <div>
                                                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                    Sinov darsi sanasi
                                                                </p>
                                                                <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                                    {new Date(currentStudent.trial_lesson_date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {tabValue === 2 && (
                                        <div className={`rounded-xl p-4 ${
                                            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                        }`}>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Manzil
                                                    </p>
                                                    <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {currentStudent.address || '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Ota-ona ismi
                                                    </p>
                                                    <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {currentStudent.parent_name || '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Ota-ona telefoni
                                                    </p>
                                                    <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {currentStudent.parent_phone || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* O'chirish Tasdiqlash Dialogi */}
                <Dialog
                    open={openDeleteDialog}
                    onClose={handleCloseDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        className: `rounded-xl backdrop-blur-lg ${
                            isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'
                        }`
                    }}
                >
                    <DialogTitle className={`text-xl font-semibold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                        O'chirishni Tasdiqlash
                    </DialogTitle>
                    <DialogContent>
                        <div className="mt-4">
                            <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Siz haqiqatan ham{' '}
                                <span className="font-medium text-yellow-500">
                                    {currentStudent?.first_name} {currentStudent?.last_name}
                                </span>{' '}
                                talabasini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
                            </p>
                        </div>
                    </DialogContent>
                    <DialogActions className="p-4">
                        <Button
                            onClick={handleCloseDialog}
                            className={`px-4 py-2 rounded-lg ${
                                isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                            }`}
                        >
                            Bekor qilish
                        </Button>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={handleDelete}
                                className={`px-4 py-2 rounded-lg text-white ${
                                    isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                O'chirish
                            </Button>
                        </motion.div>
                    </DialogActions>
                </Dialog>

                {/* Xabar Qutisi (Snackbar) */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        className={`rounded-lg ${
                            snackbar.severity === 'success'
                                ? isDarkMode
                                    ? 'bg-green-600'
                                    : 'bg-green-500'
                                : isDarkMode
                                ? 'bg-red-600'
                                : 'bg-red-500'
                        } text-white`}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </div>
        </div>
    );
}
