'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { EyeIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ChevronDownIcon, UserPlusIcon } from '@heroicons/react/20/solid';

export default function GroupStudentManagement() {
    const { user, token } = useAuth();
    const { isDarkMode, setIsDarkMode } = useTheme();
    const [groups, setGroups] = useState([]);
    const [groupStudents, setGroupStudents] = useState({});
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [currentGroup, setCurrentGroup] = useState(null);
    const [formData, setFormData] = useState({
        group_id: '',
        student_id: '',
        status: 'active'
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [pageSize, setPageSize] = useState(10);
    const [studentLimit, setStudentLimit] = useState(10);
    const [groupType, setGroupType] = useState('active');
    const [finishDialog, setFinishDialog] = useState({ open: false, group: null });
    const [moveDialog, setMoveDialog] = useState({ open: false, student: null, fromGroup: null });
    const [moveTargetGroup, setMoveTargetGroup] = useState('');
    const [activeGroups, setActiveGroups] = useState([]);

    // Custom styles for react-select
    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#374151' : '#fff',
            borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
            borderRadius: '0.5rem',
            padding: '0.25rem',
            boxShadow: 'none',
            '&:hover': {
                borderColor: isDarkMode ? '#eab308' : '#f59e0b',
            },
            '&:focus-within': {
                borderColor: '#f59e0b',
                boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.5)',
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#374151' : '#fff',
            borderRadius: '0.5rem',
            marginTop: '0.25rem',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? isDarkMode
                    ? '#eab308'
                    : '#f59e0b'
                : isDarkMode
                    ? '#374151'
                    : '#fff',
            color: state.isSelected ? '#fff' : isDarkMode ? '#d1d5db' : '#1f2937',
            '&:hover': {
                backgroundColor: isDarkMode ? '#4b5563' : '#f3f4f6',
            },
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: isDarkMode ? '#d1d5db' : '#1f2937',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: isDarkMode ? '#d1d5db' : '#1f2937',
            '&:hover': {
                backgroundColor: '#ef4444',
                color: '#fff',
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            color: isDarkMode ? '#9ca3af' : '#6b7280',
        }),
        input: (provided) => ({
            ...provided,
            color: isDarkMode ? '#fff' : '#1f2937',
        }),
    };

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            fetchData();
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchGroups();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupType, token]);

    const fetchData = async () => {
        await Promise.all([
            fetchGroupStudents(),
            fetchGroups(),
            fetchStudents()
        ]);
    };

    const fetchGroups = async () => {
        try {
            let url = 'http://localhost:5000/api/groups';
            
            if (groupType === 'archived') {
                url = `http://localhost:5000/api/groups/archived`;
            } else {
                const params = new URLSearchParams({
                    page: 1,
                    limit: 100,
                    status: groupType
                });
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                const formattedGroups = result.data.map(group => ({
                    ...group,
                    finished_at: group.finished_at ? new Date(group.finished_at).toLocaleDateString() : '',
                    start_date: group.start_date ? new Date(group.start_date).toLocaleDateString() : '',
                    end_date: group.end_date ? new Date(group.end_date).toLocaleDateString() : ''
                }));
                setGroups(formattedGroups);
                if (groupType === 'active') setActiveGroups(formattedGroups);
            } else {
                setError(result.message || 'Guruhlarni yuklab boʻlmadi');
                setGroups([]);
            }
        } catch (err) {
            setError('Guruhlarni yuklab boʻlmadi');
            setGroups([]);
        }
    };

    const fetchStudents = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                setError('Authentication required');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/students', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    limit: 10000
                }
            });

            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setError('Authentication required');
            } else {
                setError(error.response?.data?.message || 'O\'quvchilarni yuklashda xatolik yuz berdi');
            }
        }
    };

    const fetchGroupStudents = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            if (!token) {
                setError('Authentication required');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/group-students', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                // Guruhlar bo'yicha o'quvchilarni guruhlash
                const groupedStudents = response.data.data.reduce((acc, item) => {
                    const groupId = item.group_id._id;
                    if (!acc[groupId]) {
                        acc[groupId] = {
                            group: item.group_id,
                            students: []
                        };
                    }
                    acc[groupId].students.push(item);
                    return acc;
                }, {});
                setGroupStudents(groupedStudents);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setError('Authentication required');
            } else {
                setError(error.response?.data?.message || 'Guruh o\'quvchilarini yuklashda xatolik yuz berdi');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = (group) => {
        setCurrentGroup(group);
        setFormData({
            group_id: group._id,
            student_id: '',
            status: 'active'
        });
        setOpenCreateDialog(true);
    };

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setFormData({
            group_id: student.group_id._id,
            student_id: student.student_id._id,
            status: student.status
        });
        setOpenEditDialog(true);
    };

    const handleDeleteStudent = (student) => {
        setSelectedStudent(student);
        setOpenDeleteDialog(true);
    };

    const handleCreate = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                setError('Authentication required');
                return;
            }

            const response = await axios.post('http://localhost:5000/api/group-students', formData, {
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
                fetchData();
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'O\'quvchi qo\'shishda xatolik yuz berdi',
                severity: 'error'
            });
        }
    };

    const handleUpdate = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                setError('Authentication required');
                return;
            }

            const response = await axios.put(`http://localhost:5000/api/group-students/${selectedStudent._id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setSnackbar({
                    open: true,
                    message: 'O\'quvchi muvaffaqiyatli yangilandi',
                    severity: 'success'
                });
                setOpenEditDialog(false);
                fetchData();
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'O\'quvchini yangilashda xatolik yuz berdi',
                severity: 'error'
            });
        }
    };

    const handleDelete = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                setError('Authentication required');
                return;
            }

            const response = await axios.delete(`http://localhost:5000/api/group-students/${selectedStudent._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setSnackbar({
                    open: true,
                    message: 'O\'quvchi muvaffaqiyatli o\'chirildi',
                    severity: 'success'
                });
                setOpenDeleteDialog(false);
                fetchData();
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'O\'quvchini o\'chirishda xatolik yuz berdi',
                severity: 'error'
            });
        }
    };

    const finishGroup = async (groupId) => {
        try {
            if (!groupId) {
                throw new Error('Guruh ID mavjud emas');
            }
            
            const response = await axios.post(
                `http://localhost:5000/api/groups/${groupId}/finish`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success) {
                setSnackbar({
                    open: true,
                    message: 'Guruh yakunlandi',
                    severity: 'success'
                });
                fetchGroups();
                setFinishDialog({ open: false, group: null }); // Close the modal
            } else {
                setError(response.data.message || 'Guruh yakunlanishida xatolik yuz berdi');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Guruh yakunlanishida xatolik yuz berdi';
            setError(errorMessage);
        }
    };

    const moveStudent = async (studentId, fromGroupId, toGroupId) => {
        try {
            if (!studentId || !fromGroupId || !toGroupId) {
                throw new Error('Talab qilinadigan ID(lar) mavjud emas');
            }
            
            const response = await axios.post(
                'http://localhost:5000/api/groups/move-student',
                {
                    student_id: studentId,
                    from_group_id: fromGroupId,
                    to_group_id: toGroupId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success) {
                setSnackbar({
                    open: true,
                    message: 'O\'quvchi muvaffaqiyatli ko\'taytirildi',
                    severity: 'success'
                });
                setMoveDialog({ open: false, student: null, fromGroup: null });
                setMoveTargetGroup('');
                fetchData();
            } else {
                setError(response.data.message || 'O\'quvchi ko\'taytirishda xatolik yuz berdi');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'O\'quvchi ko\'taytirishda xatolik yuz berdi';
            setError(errorMessage);
        }
    };

    const handleMoveStudent = async () => {
        if (!moveDialog.student || !moveTargetGroup) return;
        moveStudent(moveDialog.student.student_id._id, moveDialog.fromGroup._id, moveTargetGroup);
    };

    const handleFinishGroup = async () => {
        if (!finishDialog.group) return;
        
        // Get the group ID from the group object
        const groupId = finishDialog.group._id || finishDialog.group.id;
        
        if (!groupId || typeof groupId !== 'string' || groupId.length !== 24) {
            setError('Noto\'g\'ri guruh ID formati');
            return;
        }

        finishGroup(groupId);
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getStudentsForGroup = (groupId) => {
        if (!Array.isArray(groupStudents)) {
            return [];
        }

        return groupStudents
            .filter((gs) => gs.group_id === groupId)
            .map((gs) => {
                const student = gs.student;
                return student ? {
                    id: student.id,
                    name: `${student.first_name} ${student.last_name}`,
                    status: gs.status
                } : null;
            })
            .filter(Boolean);
    };

    const dialogVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
    };

    const renderViewDialog = () => (
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
                    <span className="font-medium">{currentGroup?.name}</span> guruhidagi barcha talabalarni olib tashlashni istaysizmi? Bu amalni qaytarib boʻlmaydi.
                </p>
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        onClick={() => setOpenDeleteDialog(false)}
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
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'inactive':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
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
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Guruh o'quvchilari
                    </h1>
                    <button
                        onClick={() => {
                            setCurrentGroup(null);
                            setFormData({
                                group_id: '',
                                student_id: '',
                                status: 'active'
                            });
                            setOpenCreateDialog(true);
                        }}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                        Yangi o'quvchi qo'shish
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${groupType === 'active' ? 'bg-yellow-500 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setGroupType('active')}
                    >Faol guruhlar</button>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${groupType === 'archived' ? 'bg-yellow-500 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setGroupType('archived')}
                    >Arxiv guruhlar</button>
                </div>

                <div className={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Guruh
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Kurs
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        O'qituvchi
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Vaqt
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Kunlar
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Boshlanish
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Tugash
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                        Amallar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                {groups.map((group) => (
                                    <React.Fragment key={group._id}>
                                        <tr className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => toggleGroup(group._id)}
                                                        className="mr-2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {expandedGroups[group._id] ? (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {group.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {group.course_id?.name || 'Kurs mavjud emas'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {group.teacher_id ? `${group.teacher_id.first_name} ${group.teacher_id.last_name}` : 'O\'qituvchi mavjud emas'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {group.time}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {group.days}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {groupType === 'archived' 
                                                        ? group.finished_at 
                                                        : group.end_date ? new Date(group.end_date).toLocaleDateString() : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {groupType !== 'archived' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAddStudent(group)}
                                                            className={`text-yellow-500 hover:text-yellow-600 mr-4`}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                        {group._id && group._id.length === 24 && (
                                                            <button
                                                                onClick={() => setFinishDialog({ open: true, group })}
                                                                className="text-red-500 hover:text-red-600"
                                                                title="Guruhni tugatish"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                        {expandedGroups[group._id] && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4">
                                                    <div className={`rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4`}>
                                                        <div className="space-y-4">
                                                            {groupStudents[group._id]?.students?.length > 0 ? (
                                                                groupStudents[group._id].students.map((student) => (
                                                                    <div
                                                                        key={student._id}
                                                                        className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode
                                                                                ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                                                                                : 'bg-white hover:bg-gray-50 border border-gray-200'
                                                                            } transition-colors duration-200`}
                                                                    >
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                                {student.student_id.first_name} {student.student_id.last_name}
                                                                            </div>
                                                                            <div className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                                {student.student_id.phone}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${student.status === 'active'
                                                                                    ? isDarkMode
                                                                                        ? 'bg-green-900 text-green-200'
                                                                                        : 'bg-green-100 text-green-800'
                                                                                    : isDarkMode
                                                                                        ? 'bg-red-900 text-red-200'
                                                                                        : 'bg-red-100 text-red-800'
                                                                                }`}>
                                                                                {student.status === 'active' ? 'Faol' : 'Nofaol'}
                                                                            </span>
                                                                            <div className={`text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                                {new Date(student.joined_at).toLocaleDateString()}
                                                                            </div>
                                                                            <div className="flex space-x-2">
                                                                                <button
                                                                                    onClick={() => handleDeleteStudent(student)}
                                                                                    className={`p-1 rounded-lg ${isDarkMode
                                                                                            ? 'text-gray-400 hover:text-red-500 hover:bg-gray-700'
                                                                                            : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                                                                                        } transition-colors duration-200`}
                                                                                >
                                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                    </svg>
                                                                                </button>
                                                                                {groupType === 'active' && (
                                                                                    <button
                                                                                        onClick={() => setMoveDialog({ open: true, student, fromGroup: group })}
                                                                                        className={`p-1 rounded-lg ${isDarkMode ? 'text-blue-400 hover:text-blue-500 hover:bg-gray-700' : 'text-blue-500 hover:text-blue-600 hover:bg-gray-100'} transition-colors duration-200`}
                                                                                        title="Boshqa guruhga o'tkazish"
                                                                                    >
                                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                                                                                        </svg>
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                    Bu guruhda o'quvchilar yo'q
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Dialog */}
                {openCreateDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                O'quvchi qo'shish
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        O'quvchi
                                    </label>
                                    <select
                                        value={formData.student_id}
                                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    >
                                        <option value="">O'quvchini tanlang</option>
                                        {students.map((student) => (
                                            <option key={student._id} value={student._id}>
                                                {student.last_name} {student.first_name} - {student.phone}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Holati
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
                                </div> */}
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                O'quvchini tahrirlash
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Holati
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

                {/* Delete Dialog */}
                {openDeleteDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                O'quvchini o'chirish
                            </h2>
                            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                O'quvchini o'chirishni xohlaysizmi?
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setOpenDeleteDialog(false)}
                                    className={`px-4 py-2 rounded-lg ${isDarkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    O'chirish
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Finish Dialog */}
                {finishDialog.open && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}> 
                            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Guruhni tugatish</h2>
                            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Rostdan ham ushbu guruhni tugatmoqchimisiz?</p>
                            <div className="flex justify-end space-x-3">
                                <button onClick={() => setFinishDialog({ open: false, group: null })} className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Bekor qilish</button>
                                <button onClick={handleFinishGroup} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Tugatish</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Move Dialog */}
                {moveDialog.open && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}> 
                            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>O'quvchini boshqa guruhga o'tkazish</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Yangi guruh</label>
                                    <select
                                        value={moveTargetGroup}
                                        onChange={e => setMoveTargetGroup(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    >
                                        <option value="">Guruhni tanlang</option>
                                        {activeGroups.filter(g => g._id !== moveDialog.fromGroup._id).map(g => (
                                            <option value={g._id} key={g._id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button onClick={() => setMoveDialog({ open: false, student: null, fromGroup: null })} className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Bekor qilish</button>
                                <button onClick={handleMoveStudent} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">O'tkazish</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Snackbar */}
                {snackbar.open && (
                    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg ${snackbar.severity === 'success'
                            ? isDarkMode
                                ? 'bg-green-900 text-green-200'
                                : 'bg-green-100 text-green-800'
                            : isDarkMode
                                ? 'bg-red-900 text-red-200'
                                : 'bg-red-100 text-red-800'
                        }`}>
                        {snackbar.message}
                    </div>
                )}
            </div>
        </div>
    );
}
