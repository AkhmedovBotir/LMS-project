'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Switch from '@mui/material/Switch';
import { AsyncPaginate } from 'react-select-async-paginate';
import ReactSelect from 'react-select';

export default function GroupsManagement() {
    const { user, token } = useAuth();
    const { isDarkMode } = useTheme();
    const [groups, setGroups] = useState([]);
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });

    // Form state for group
    const [formData, setFormData] = useState({
        name: '',
        startTime: '',
        endTime: '',
        days: '',
        course_id: null,
        teacher_id: null,
        status: 'active',
        start_date: '',
        end_date: '',
        tarif_type: 'standart',
    });

    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        course_id: null,
        teacher_id: null,
        status: '',
        start_date: '',
        end_date: ''
    });

    // Reset pagination when filters change
    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
    }, [filters.course_id, filters.teacher_id, filters.status, filters.start_date, filters.end_date]);

    const [selectedCourse, setSelectedCourse] = useState(null);

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
            borderColor: state.isFocused
                ? (isDarkMode ? '#facc15' : '#f59e42')
                : (isDarkMode ? '#374151' : '#d1d5db'),
            color: isDarkMode ? '#fff' : '#111827',
            boxShadow: state.isFocused ? `0 0 0 2px ${isDarkMode ? '#facc15' : '#f59e42'}` : undefined,
            '&:hover': {
                borderColor: isDarkMode ? '#facc15' : '#f59e42',
            },
            minHeight: 44,
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
            color: isDarkMode ? '#fff' : '#111827',
            zIndex: 9999,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? (isDarkMode ? '#facc15' : '#f59e42')
                : state.isFocused
                    ? (isDarkMode ? '#374151' : '#fef3c7')
                    : (isDarkMode ? '#1f2937' : '#fff'),
            color: state.isSelected
                ? (isDarkMode ? '#1f2937' : '#fff')
                : (isDarkMode ? '#fff' : '#111827'),
            cursor: 'pointer',
        }),
        singleValue: (base) => ({
            ...base,
            color: isDarkMode ? '#fff' : '#111827',
        }),
        input: (base) => ({
            ...base,
            color: isDarkMode ? '#fff' : '#111827',
        }),
        placeholder: (base) => ({
            ...base,
            color: isDarkMode ? '#9ca3af' : '#6b7280',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: isDarkMode ? '#facc15' : '#f59e42',
            '&:hover': {
                color: isDarkMode ? '#fde047' : '#fbbf24',
            },
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: isDarkMode ? '#374151' : '#d1d5db',
        }),
        clearIndicator: (base) => ({
            ...base,
            color: isDarkMode ? '#f87171' : '#ef4444',
            '&:hover': {
                color: isDarkMode ? '#fca5a5' : '#f87171',
            },
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: isDarkMode ? '#facc15' : '#f59e42',
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: isDarkMode ? '#f87171' : '#ef4444',
            ':hover': {
                backgroundColor: isDarkMode ? '#991b1b' : '#fee2e2',
                color: isDarkMode ? '#fff' : '#b91c1c',
            },
        }),
    };

    useEffect(() => {
        if (token) {
            fetchGroups();
            fetchCourses();
            fetchTeachers();
        }
    }, [token, pagination.currentPage, search, filters.course_id, filters.teacher_id, filters.status, filters.start_date, filters.end_date]);

    const fetchGroups = async () => {
        try {
            console.log('Fetching groups...');
            const queryParams = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                search: search,
                course_id: filters.course_id ? filters.course_id._id : '',
                teacher_id: filters.teacher_id ? filters.teacher_id._id : '',
                status: filters.status,
                start_date: filters.start_date,
                end_date: filters.end_date
            });

            const response = await fetch(`http://localhost:5000/api/groups?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            console.log('Groups data:', data);

            if (response.ok && data.success) {
                setGroups(data.data || []);
                
                if (data.pagination) {
                    setPagination({
                        ...pagination,
                        total: data.pagination.total || 0,
                        totalPages: data.pagination.total_pages || 1,
                        currentPage: data.pagination.page || 1
                    });
                }
            } else {
                setError(data.message || 'Guruhlarni yuklab boʻlmadi');
            }
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError('Guruhlarni yuklab boʻlmadi');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            console.log('Fetching courses...');
            const response = await fetch('http://localhost:5000/api/courses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            console.log('Courses data:', data);

            if (response.ok) {
                // API javobini to'g'ri formatda olish
                const coursesData = Array.isArray(data) ? data : (data.data || []);
                setCourses(coursesData);
            } else {
                console.error('Kurslarni yuklab boʻlmadi:', data.message);
            }
        } catch (err) {
            console.error('Kurslarni yuklashda xatolik:', err);
        }
    };

    const fetchTeachers = async () => {
        try {
            console.log('Fetching teachers...');
            const response = await fetch('http://localhost:5000/api/employees', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            console.log('Teachers data:', data);

            if (response.ok) {
                // API javobidan employees massivini olish
                const teachersData = data.data || [];
                setTeachers(teachersData);
            } else {
                console.error('Oʻqituvchilarni yuklab boʻlmadi:', data.message);
            }
        } catch (err) {
            console.error('Oʻqituvchilarni yuklashda xatolik:', err);
        }
    };

    const handleOpenCreateDialog = () => {
        setCurrentGroup(null);
        setFormData({
            name: '',
            startTime: '',
            endTime: '',
            days: '',
            course_id: null,
            teacher_id: null,
            status: 'active',
            start_date: '',
            end_date: '',
            tarif_type: 'standart',
        });
        setOpenCreateDialog(true);
    };

    const handleOpenEditDialog = (group) => {
        setCurrentGroup(group);
        const [startTime, endTime] = (group.time || '').split('-');
        setFormData({
            name: group.name,
            startTime: startTime || '',
            endTime: endTime || '',
            days: group.days || '',
            course_id: group.course_id ? { value: group.course_id._id, label: group.course_id.name } : null,
            teacher_id: group.teacher_id ? { value: group.teacher_id._id, label: group.teacher_id.first_name + ' ' + group.teacher_id.last_name } : null,
            status: group.status || 'active',
            start_date: group.start_date ? new Date(group.start_date).toISOString().split('T')[0] : '',
            end_date: group.end_date ? new Date(group.end_date).toISOString().split('T')[0] : '',
            tarif_type: group.tarif_type || 'standart',
        });
        setOpenEditDialog(true);
    };

    const handleOpenViewDialog = (group) => {
        setCurrentGroup(group);
        setOpenViewDialog(true);
    };

    const handleOpenDeleteDialog = (group) => {
        setCurrentGroup(group);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenCreateDialog(false);
        setOpenEditDialog(false);
        setOpenViewDialog(false);
        setOpenDeleteDialog(false);
        setCurrentGroup(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Agar vaqt maydonlari o'zgartirilgan bo'lsa, time maydonini yangilash
            if (name === 'startTime' || name === 'endTime') {
                const startTime = name === 'startTime' ? value : prev.startTime;
                const endTime = name === 'endTime' ? value : prev.endTime;
                if (startTime && endTime) {
                    newData.time = `${startTime}-${endTime}`;
                }
            }

            // Agar boshlash sanasi o'zgartirilgan bo'lsa, tugash sanasini hisoblash
            if (name === 'start_date' && value) {
                const selectedCourse = courses.find(course => course.id === prev.course_id);
                if (selectedCourse) {
                    const startDate = new Date(value);
                    const endDate = new Date(startDate);
                    endDate.setMonth(endDate.getMonth() + selectedCourse.duration_months);
                    newData.end_date = endDate.toISOString().split('T')[0];
                }
            }

            // Agar kurs o'zgartirilgan bo'lsa va boshlash sanasi mavjud bo'lsa, tugash sanasini yangilash
            if (name === 'course_id' && prev.start_date) {
                const selectedCourse = courses.find(course => course.id === value);
                if (selectedCourse) {
                    const startDate = new Date(prev.start_date);
                    const endDate = new Date(startDate);
                    endDate.setMonth(endDate.getMonth() + selectedCourse.duration_months);
                    newData.end_date = endDate.toISOString().split('T')[0];
                }
            }
            
            return newData;
        });
    };

    const groupDays = (daysString) => {
        if (!daysString) return '';
        // Split the days string by commas and trim whitespace
        const daysArray = daysString.split(',').map(day => day.trim());
        // Join the days back into a string with commas
        return daysArray.join(', ');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    time: `${formData.startTime}-${formData.endTime}`,
                    days: formData.days,
                    course_id: formData.course_id?.value,
                    teacher_id: formData.teacher_id?.value,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    status: formData.status,
                    tarif_type: formData.tarif_type,
                }),
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || 'Guruh muvaffaqiyatli yaratildi',
                    severity: 'success',
                });
                handleCloseDialog();
                fetchGroups();
            } else {
                setError(result.message || 'Guruh yaratishda xatolik yuz berdi');
            }
        } catch (err) {
            setError('Guruh yaratishda xatolik yuz berdi');
            console.error('Guruh yaratishda xatolik:', err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/groups/${currentGroup._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    time: `${formData.startTime}-${formData.endTime}`,
                    days: formData.days,
                    course_id: formData.course_id?.value,
                    teacher_id: formData.teacher_id?.value,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    status: formData.status,
                    tarif_type: formData.tarif_type,
                }),
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || 'Guruh muvaffaqiyatli yangilandi',
                    severity: 'success',
                });
                handleCloseDialog();
                fetchGroups();
            } else {
                setError(result.message || 'Guruh yangilashda xatolik yuz berdi');
            }
        } catch (err) {
            setError('Guruh yangilashda xatolik yuz berdi');
            console.error('Guruh yangilashda xatolik:', err);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/groups/${currentGroup._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || 'Guruh muvaffaqiyatli o\'chirildi',
                    severity: 'success',
                });
                handleCloseDialog();
                fetchGroups();
            } else {
                setError(result.message || 'Guruh o\'chirishda xatolik yuz berdi');
            }
        } catch (err) {
            setError('Guruh o\'chirishda xatolik yuz berdi');
            console.error('Guruh o\'chirishda xatolik:', err);
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

    // Add helper functions to fetch paginated options for courses and teachers
    const fetchCourseOptions = async (search, loadedOptions, { page }) => {
        const response = await fetch(`http://localhost:5000/api/courses?page=${page}&limit=10&search=${search || ''}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        const options = (data.data || []).map(course => ({ value: course._id || course.id, label: course.name }));
        return {
            options,
            hasMore: data.pagination ? data.pagination.page < data.pagination.total_pages : false,
            additional: { page: (data.pagination?.page || 1) + 1 },
        };
    };
    const fetchTeacherOptions = async (search, loadedOptions, { page }) => {
        const response = await fetch(`http://localhost:5000/api/employees?page=${page}&limit=10&search=${search || ''}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        const options = (data.data || []).map(teacher => ({ value: teacher._id || teacher.id, label: `${teacher.first_name} ${teacher.last_name}` }));
        return {
            options,
            hasMore: data.pagination ? data.pagination.page < data.pagination.total_pages : false,
            additional: { page: (data.pagination?.page || 1) + 1 },
        };
    };

    // Fetch course details when course_id changes
    useEffect(() => {
        const fetchCourseDetail = async () => {
            if (formData.course_id && formData.course_id.value) {
                const res = await fetch(`http://localhost:5000/api/courses/${formData.course_id.value}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const data = await res.json();
                setSelectedCourse(data.data || null);
            } else {
                setSelectedCourse(null);
            }
        };
        fetchCourseDetail();
    }, [formData.course_id, token]);

    // Calculate end_date when start_date, tarif_type, or selectedCourse changes
    useEffect(() => {
        if (formData.start_date && selectedCourse && formData.tarif_type) {
            let months = 0;
            if (formData.tarif_type === 'standart') {
                months = selectedCourse.standart_duration_months || 0;
            } else if (formData.tarif_type === 'intensive') {
                months = selectedCourse.intensive_duration_months || 0;
            }
            if (months > 0) {
                const start = new Date(formData.start_date);
                const end = new Date(start);
                end.setMonth(end.getMonth() + months);
                setFormData(prev => ({ ...prev, end_date: end.toISOString().split('T')[0] }));
            } else {
                setFormData(prev => ({ ...prev, end_date: '' }));
            }
        } else {
            setFormData(prev => ({ ...prev, end_date: '' }));
        }
    }, [formData.start_date, formData.tarif_type, selectedCourse]);

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
                        Guruhlar Boshqaruvi
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenCreateDialog}
                        className={`flex items-center px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                    >
                        Guruh Qoʻshish
                    </motion.button>
                </div>

                {/* Search and Filter Section */}
                <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Qidirish
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Guruh nomini kiriting..."
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                            />
                        </div>

                        {/* Course Filter */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Kurs
                            </label>
                            <AsyncPaginate
                                value={filters.course_id}
                                loadOptions={fetchCourseOptions}
                                onChange={option => setFilters(prev => ({ ...prev, course_id: option }))}
                                additional={{ page: 1 }}
                                placeholder="Kursni tanlang"
                                isClearable
                                styles={selectStyles}
                            />
                        </div>

                        {/* Teacher Filter */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                O'qituvchi
                            </label>
                            <AsyncPaginate
                                value={filters.teacher_id}
                                loadOptions={fetchTeacherOptions}
                                onChange={option => setFilters(prev => ({ ...prev, teacher_id: option }))}
                                additional={{ page: 1 }}
                                placeholder="Oʻqituvchini tanlang"
                                isClearable
                                styles={selectStyles}
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Holat
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                            >
                                <option value="">Barcha holatlar</option>
                                <option value="active">Faol</option>
                                <option value="inactive">Nofaol</option>
                                <option value="completed">Yakunlangan</option>
                            </select>
                        </div>
                    </div>

                    {/* Date Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Boshlanish sanasi
                            </label>
                            <input
                                type="date"
                                value={filters.start_date}
                                onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
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
                                value={filters.end_date}
                                onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
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
                                    course_id: null,
                                    teacher_id: null,
                                    status: '',
                                    start_date: '',
                                    end_date: ''
                                });
                                setPagination(prev => ({ ...prev, currentPage: 1 }));
                                fetchGroups();
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
                                setPagination(prev => ({ ...prev, currentPage: 1 }));
                                fetchGroups();
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

                <div className={`rounded-xl shadow-lg overflow-hidden backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/80 border border-gray-200/50'}`}>
                    <table className="w-full">
                        <thead>
                            <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nomi</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kurs</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Oʻqituvchi</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vaqti</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kunlari</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Holati</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Boshlanish</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tugash</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tarif turi</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Harakatlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(groups) && groups.length > 0 ? (
                                groups.map((group) => (
                                <motion.tr
                                    key={group._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}
                                >
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{group.name}</td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{group.course_id?.name}</td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {group.teacher_id?.first_name} {group.teacher_id?.last_name}
                                    </td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{group.time}</td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{group.days}</td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {group.status === 'active' ? 'Faol' : group.status === 'inactive' ? 'Nofaol' : 'Yakunlangan'}
                                    </td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {new Date(group.start_date).toLocaleDateString('uz-UZ')}
                                    </td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {new Date(group.end_date).toLocaleDateString('uz-UZ')}
                                    </td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {group.tarif_type === 'standart' ? 'Standart' : 'Intensive'}
                                    </td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenViewDialog(group)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenEditDialog(group)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-yellow-600 hover:bg-gray-100'}`}
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenDeleteDialog(group)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </motion.button>
                                    </td>
                                </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Guruhlar mavjud emas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Jami {pagination.total} ta guruh
                            </p>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
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
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {pagination.currentPage} / {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
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

                {/* Create Group Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openCreateDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openCreateDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-8 w-full max-w-3xl backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Yangi Guruh Yaratish
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Nomi
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
                                    placeholder="Guruh nomini kiriting"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Vaqti
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        required
                                        className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    />
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        required
                                        className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Kunlari
                                </label>
                                <select
                                    name="days"
                                    value={formData.days}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                >
                                    <option value="">Kunlarni tanlang</option>
                                    <option value="Har kuni">Har kuni</option>
                                    <option value="Dushanba, Chorshanba, Juma">Dushanba, Chorshanba, Juma</option>
                                    <option value="Seshanba, Payshanba, Shanba">Seshanba, Payshanba, Shanba</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Kurs
                                </label>
                                    <AsyncPaginate
                                    value={formData.course_id}
                                        loadOptions={fetchCourseOptions}
                                        onChange={option => setFormData(prev => ({ ...prev, course_id: option }))}
                                        additional={{ page: 1 }}
                                        placeholder="Kursni tanlang"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Oʻqituvchi
                                    </label>
                                    <AsyncPaginate
                                        value={formData.teacher_id}
                                        loadOptions={fetchTeacherOptions}
                                        onChange={option => setFormData(prev => ({ ...prev, teacher_id: option }))}
                                        additional={{ page: 1 }}
                                        placeholder="Oʻqituvchini tanlang"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Holati
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                >
                                        <option value="active">Faol</option>
                                        <option value="inactive">Nofaol</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Tarif turi
                                </label>
                                <select
                                        name="tarif_type"
                                        value={formData.tarif_type}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                >
                                        <option value="standart">Standart</option>
                                        <option value="intensive">Intensive</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Boshlash sanasi
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Tugash sanasi
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                />
                            </div>
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

                {/* Edit Group Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openEditDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openEditDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-8 w-full max-w-3xl backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Guruhni Tahrirlash
                        </h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Nomi
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
                                    placeholder="Guruh nomini kiriting"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Vaqti
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        required
                                        className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    />
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        required
                                        className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Kunlari
                                </label>
                                <select
                                    name="days"
                                    value={formData.days}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                >
                                    <option value="">Kunlarni tanlang</option>
                                    <option value="Har kuni">Har kuni</option>
                                    <option value="Dushanba, Chorshanba, Juma">Dushanba, Chorshanba, Juma</option>
                                    <option value="Seshanba, Payshanba, Shanba">Seshanba, Payshanba, Shanba</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Kurs
                                </label>
                                    <AsyncPaginate
                                    value={formData.course_id}
                                        loadOptions={fetchCourseOptions}
                                        onChange={option => setFormData(prev => ({ ...prev, course_id: option }))}
                                        additional={{ page: 1 }}
                                        placeholder="Kursni tanlang"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Oʻqituvchi
                                    </label>
                                    <AsyncPaginate
                                        value={formData.teacher_id}
                                        loadOptions={fetchTeacherOptions}
                                        onChange={option => setFormData(prev => ({ ...prev, teacher_id: option }))}
                                        additional={{ page: 1 }}
                                        placeholder="Oʻqituvchini tanlang"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Holati
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                >
                                        <option value="active">Faol</option>
                                        <option value="inactive">Nofaol</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Tarif turi
                                </label>
                                <select
                                        name="tarif_type"
                                        value={formData.tarif_type}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                >
                                        <option value="standart">Standart</option>
                                        <option value="intensive">Intensive</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Boshlash sanasi
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Tugash sanasi
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    required
                                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                />
                            </div>
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

                {/* View Group Dialog */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openViewDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openViewDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-8 w-full max-w-3xl backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Guruh Tafsilotlari
                        </h2>
                        {currentGroup && (
                            <div className="space-y-3">
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Nomi:</span> {currentGroup.name}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Vaqti:</span> {currentGroup.time}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Kunlari:</span> {currentGroup.days}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Kurs:</span> {currentGroup.course_id?.name || '-'}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Oʻqituvchi:</span> {currentGroup.teacher_id ? (
                                        <span>
                                            {currentGroup.teacher_id.first_name} {currentGroup.teacher_id.last_name}
                                        </span>
                                    ) : '-'}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Boshlash sanasi:</span> {new Date(currentGroup.start_date).toLocaleDateString()}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Tugash sanasi:</span> {new Date(currentGroup.end_date).toLocaleDateString()}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Holati:</span> {currentGroup.status === 'active' ? 'Faol' : currentGroup.status === 'inactive' ? 'Nofaol' : 'Yakunlangan'}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Tarif turi:</span> {currentGroup.tarif_type === 'standart' ? 'Standart' : 'Intensive'}
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
                    <div className={`rounded-xl p-8 w-full max-w-3xl backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Oʻchirishni Tasdiqlash
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-medium">{currentGroup?.name}</span> guruhini oʻchirishni istaysizmi? Bu amalni qaytarib boʻlmaydi.
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