'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Switch from '@mui/material/Switch';

export default function CoursesManagement() {
    const { user, token } = useAuth();
    const { isDarkMode } = useTheme();
    const [courses, setCourses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        standart_price: '',
        standart_duration_months: '',
        intensive_price: '',
        intensive_duration_months: '',
        instructor_id: ''
    });

    useEffect(() => {
        if (token) {
            fetchCourses();
            fetchTeachers();
        }
    }, [token, pagination.currentPage]);

    const fetchCourses = async () => {
        try {
            const queryParams = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit
            });

            const response = await fetch(`http://localhost:5000/api/courses?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                setCourses(result.data || []);
                setPagination({
                    ...pagination,
                    total: result.pagination?.total || 0,
                    totalPages: result.pagination?.total_pages || 1,
                    currentPage: result.pagination?.page || 1,
                    limit: result.pagination?.limit || 10
                });
            } else {
                setError(result.message || 'Kurslarni yuklab boʻlmadi');
            }
        } catch (err) {
            setError('Kurslarni yuklab boʻlmadi');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/employees', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                setInstructors(result.data || []);
            } else {
                console.error('Xodimlarni yuklab bo\'lmadi:', result.message);
            }
        } catch (err) {
            console.error('Xodimlarni yuklashda xatolik:', err);
        }
    };

    const handleOpenCreateDialog = () => {
        setCurrentCourse(null);
        setFormData({
            name: '',
            description: '',
            standart_price: '',
            standart_duration_months: '',
            intensive_price: '',
            intensive_duration_months: '',
            instructor_id: ''
        });
        setOpenCreateDialog(true);
    };

    const handleOpenEditDialog = (course) => {
        setCurrentCourse(course);
        setFormData({
            name: course.name,
            description: course.description || '',
            standart_price: course.standart_price,
            standart_duration_months: course.standart_duration_months,
            intensive_price: course.intensive_price,
            intensive_duration_months: course.intensive_duration_months,
            instructor_id: course.instructor_id?._id || course.instructor_id || ''
        });
        setOpenEditDialog(true);
    };

    const handleOpenViewDialog = (course) => {
        setCurrentCourse(course);
        setOpenViewDialog(true);
    };

    const handleOpenDeleteDialog = (course) => {
        setCurrentCourse(course);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenCreateDialog(false);
        setOpenEditDialog(false);
        setOpenViewDialog(false);
        setOpenDeleteDialog(false);
        setCurrentCourse(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = async (course) => {
        try {
            const newStatus = course.status === 'active' ? 'inactive' : 'active';
            const response = await fetch(`http://localhost:5000/api/courses/${course._id}/status`, {
                method: 'PATCH',
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
                    message: result.message || 'Kurs holati yangilandi',
                    severity: 'success',
                });
                fetchCourses();
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
            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    standart_price: parseInt(formData.standart_price),
                    standart_duration_months: parseInt(formData.standart_duration_months),
                    intensive_price: parseInt(formData.intensive_price),
                    intensive_duration_months: parseInt(formData.intensive_duration_months),
                    instructor_id: formData.instructor_id
                }),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || 'Kurs muvaffaqiyatli yaratildi',
                    severity: 'success',
                });
                handleCloseDialog();
                fetchCourses();
            } else {
                setError(result.message || 'Kurs yaratishda xatolik yuz berdi');
            }
        } catch (err) {
            setError('Kurs yaratishda xatolik yuz berdi');
            console.error('Kurs yaratishda xatolik:', err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/courses/${currentCourse._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    standart_price: parseInt(formData.standart_price),
                    standart_duration_months: parseInt(formData.standart_duration_months),
                    intensive_price: parseInt(formData.intensive_price),
                    intensive_duration_months: parseInt(formData.intensive_duration_months),
                    instructor_id: formData.instructor_id,
                    status: currentCourse.status // Only for update
                }),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || 'Kurs muvaffaqiyatli yangilandi',
                    severity: 'success',
                });
                handleCloseDialog();
                fetchCourses();
            } else {
                setError(result.message || 'Kurs yangilashda xatolik yuz berdi');
            }
        } catch (err) {
            setError('Kurs yangilashda xatolik yuz berdi');
            console.error('Kurs yangilashda xatolik:', err);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/courses/${currentCourse._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || 'Kurs o\'chirildi',
                    severity: 'success',
                });
                fetchCourses();
                handleCloseDialog();
            } else {
                throw new Error(result.message || 'Kursni o\'chirib bo\'lmadi');
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Kursni o\'chirib bo\'lmadi',
                severity: 'error',
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const dialogVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
    };

    const renderInstructorField = () => (
        <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Oʻqituvchi *
            </label>
            <select
                name="instructor_id"
                value={formData.instructor_id}
                onChange={handleInputChange}
                required
                className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            >
                <option value="">Oʻqituvchini tanlang</option>
                {instructors && instructors.length > 0 ? (
                    instructors.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                            {employee.first_name} {employee.last_name} 
                            {employee.position ? ` (${employee.position})` : ''}
                        </option>
                    ))
                ) : (
                    <option value="" disabled>Xodimlar mavjud emas</option>
                )}
            </select>
        </div>
    );

    const renderViewDialog = () => (
        <motion.div
            variants={dialogVariants}
            initial="hidden"
            animate={openViewDialog ? "visible" : "hidden"}
            exit="exit"
            className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openViewDialog && 'hidden'}`}
        >
            <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                    Kurs Tafsilotlari
                </h2>
                {currentCourse && (
                    <div className="space-y-3">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-medium">Nomi:</span> {currentCourse.name}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-medium">Tavsif:</span> {currentCourse.description || '-'}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-medium">Standart narxi:</span> {currentCourse.standart_price.toLocaleString()} so'm
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-medium">Standart davomiyligi:</span> {currentCourse.standart_duration_months} oy
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-medium">Intensive narxi:</span> {currentCourse.intensive_price.toLocaleString()} so'm
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-medium">Intensive davomiyligi:</span> {currentCourse.intensive_duration_months} oy
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-medium">Oʻqituvchi:</span> {currentCourse.instructor_id ? (
                                <span>
                                    {currentCourse.instructor_id.first_name} {currentCourse.instructor_id.last_name}
                                </span>
                            ) : '-'}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-medium">Holati:</span> {currentCourse.status === 'active' ? 'Faol' : 'Nofaol'}
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
    );

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
                        Kurslar Boshqaruvi
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenCreateDialog}
                        className={`flex items-center px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                    >
                        Kurs Qoʻshish
                    </motion.button>
                </div>

                <div className={`rounded-xl shadow-lg overflow-hidden backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/80 border border-gray-200/50'}`}>
                    <table className="w-full">
                        <thead>
                            <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nomi</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tavsif</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Standart narxi</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Standart davomiyligi</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Intensive narxi</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Intensive davomiyligi</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Holati</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Harakatlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <motion.tr
                                    key={course.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}
                                >
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{course.name}</td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {course.description.length > 50 
                                            ? `${course.description.substring(0, 50)}...` 
                                            : course.description}
                                    </td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{course.standart_price} soʻm</td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{course.standart_duration_months} oy</td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{course.intensive_price} soʻm</td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{course.intensive_duration_months} oy</td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={course.status === 'active'}
                                                onChange={() => handleStatusChange(course)}
                                                color="warning"
                                            />
                                            <span>{course.status === 'active' ? 'Faol' : 'Nofaol'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenViewDialog(course)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenEditDialog(course)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-yellow-600 hover:bg-gray-100'}`}
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenDeleteDialog(course)}
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
                            Jami {pagination.total} ta kurs
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

                {/* Create Course Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openCreateDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openCreateDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Yangi Kurs Yaratish
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Nomi *
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
                                    placeholder="Kurs nomini kiriting"
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
                                    placeholder="Tavsifni kiriting"
                                    rows="4"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Standart narxi *
                                </label>
                                <input
                                    type="number"
                                    name="standart_price"
                                    value={formData.standart_price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Standart narxi"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Standart davomiyligi (oy) *
                                </label>
                                <input
                                    type="number"
                                    name="standart_duration_months"
                                    value={formData.standart_duration_months}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Standart davomiyligi"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Intensive narxi *
                                </label>
                                <input
                                    type="number"
                                    name="intensive_price"
                                    value={formData.intensive_price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Intensive narxi"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Intensive davomiyligi (oy) *
                                </label>
                                <input
                                    type="number"
                                    name="intensive_duration_months"
                                    value={formData.intensive_duration_months}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Intensive davomiyligi"
                                />
                            </div>
                            <div>
                                {renderInstructorField()}
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

                {/* Edit Course Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openEditDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openEditDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Kursni Tahrirlash
                        </h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Nomi *
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
                                    placeholder="Kurs nomini kiriting"
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
                                    placeholder="Tavsifni kiriting"
                                    rows="4"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Standart narxi *
                                </label>
                                <input
                                    type="number"
                                    name="standart_price"
                                    value={formData.standart_price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Standart narxi"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Standart davomiyligi (oy) *
                                </label>
                                <input
                                    type="number"
                                    name="standart_duration_months"
                                    value={formData.standart_duration_months}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Standart davomiyligi"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Intensive narxi *
                                </label>
                                <input
                                    type="number"
                                    name="intensive_price"
                                    value={formData.intensive_price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Intensive narxi"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Intensive davomiyligi (oy) *
                                </label>
                                <input
                                    type="number"
                                    name="intensive_duration_months"
                                    value={formData.intensive_duration_months}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    placeholder="Intensive davomiyligi"
                                />
                            </div>
                            <div>
                                {renderInstructorField()}
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

                {/* View Course Dialog */}
                {renderViewDialog()}

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
                            <span className="font-medium">{currentCourse?.name}</span> kursini oʻchirishni istaysizmi? Bu amalni qaytarib boʻlmaydi.
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