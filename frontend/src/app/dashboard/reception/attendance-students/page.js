'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { EyeIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function AttendanceStudentManagement() {
    const { user, token } = useAuth();
    const { isDarkMode } = useTheme();
    const [attendances, setAttendances] = useState([]);
    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [groupStudents, setGroupStudents] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [currentAttendance, setCurrentAttendance] = useState(null);
    const [currentAction, setCurrentAction] = useState(null); // 'view', 'edit', 'create', 'delete'
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Month navigation
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCell, setSelectedCell] = useState(null); // {studentId, date}

    // Form state
    const [formData, setFormData] = useState({
        studentId: '',
        groupId: '',
        date: '',
        status: 'present',
    });

    useEffect(() => {
        if (token) {
            fetchGroups();
            fetchGroupStudents();
            fetchStudents();
            fetchAttendances();
        }
    }, [token, currentDate, selectedGroupId]);

    const fetchAttendances = async () => {
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const response = await fetch(`http://localhost:5000/api/attendance-students`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const responseData = await response.json();

            if (response.ok && responseData.success) {
                const attendanceData = Array.isArray(responseData.data) ? responseData.data : [];
                setAttendances(attendanceData);
            } else {
                setError(responseData.message || 'Davomat ma\'lumotlarini yuklashda xatolik');
            }
        } catch (err) {
            console.error('Attendance fetch error:', err);
            setError('Davomat ma\'lumotlarini yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/students', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setStudents(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            setError('Talabalarni yuklab boʻlmadi');
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/groups', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                const groupsData = Array.isArray(data.data) ? data.data : [];
                setGroups(groupsData);
                if (groupsData.length > 0 && !selectedGroupId) {
                    setSelectedGroupId(groupsData[0].id.toString());
                }
            } else {
                setError(data.error || 'Guruhlarni yuklab boʻlmadi');
            }
        } catch (err) {
            setError('Guruhlarni yuklab boʻlmadi');
        }
    };

    const fetchGroupStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/group-students', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setGroupStudents(Array.isArray(data.data) ? data.data : []);
            } else {
                setError(data.error || 'Guruh talabalarini yuklab boʻlmadi');
            }
        } catch (err) {
            setError('Guruh talabalarini yuklab boʻlmadi');
        }
    };

    const handleOpenModal = (action, attendance = null, cellData = null) => {
        setCurrentAction(action);
        setCurrentAttendance(attendance);

        if (cellData) {
            const existingAttendance = attendances.find(
                (att) => att.student_id._id === cellData.studentId && att.date === cellData.date
            );

            if (existingAttendance) {
                setCurrentAttendance(existingAttendance);
                setFormData({
                    studentId: existingAttendance.student_id._id,
                    groupId: existingAttendance.group_id._id,
                    date: existingAttendance.date,
                    status: ['present', 'absent', 'late'].includes(existingAttendance.status)
                        ? existingAttendance.status
                        : 'present',
                });
            } else {
                setFormData({
                    studentId: cellData.studentId,
                    groupId: selectedGroupId,
                    date: cellData.date,
                    status: 'present',
                });
            }
        } else if (action === 'create') {
            setFormData({
                studentId: '',
                groupId: selectedGroupId,
                date: '',
                status: 'present',
            });
        }

        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentAction(null);
        setCurrentAttendance(null);
        setSelectedCell(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.studentId || !formData.groupId || !formData.date || !formData.status) {
                throw new Error('Talaba, guruh, sana va status tanlanishi shart');
            }

            let response;
            let successMessage = '';

            if (currentAction === 'edit' && currentAttendance) {
                response = await fetch(`http://localhost:5000/api/attendance-students/${currentAttendance.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                });
                successMessage = 'Davomat muvaffaqiyatli yangilandi';
            } else {
                response = await fetch('http://localhost:5000/api/attendance-students', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                });
                successMessage = 'Davomat muvaffaqiyatli yaratildi';
            }

            const data = await response.json();

            if (response.ok) {
                setSnackbar({
                    open: true,
                    message: successMessage,
                    severity: 'success',
                });
                fetchAttendances();
                handleCloseModal();
            } else {
                throw new Error(data.message || 'Amalni bajarishda xatolik');
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
            const response = await fetch(`http://localhost:5000/api/attendance-students/${currentAttendance.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setSnackbar({
                    open: true,
                    message: 'Davomat muvaffaqiyatli o\'chirildi',
                    severity: 'success',
                });
                fetchAttendances();
                handleCloseModal();
            } else {
                throw new Error('Davomatni o\'chirishda xatolik yuz berdi');
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
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // Month navigation functions
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToCurrentMonth = () => {
        setCurrentDate(new Date());
    };

    // Get days in month
    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    // Get attendance status for a specific student and date
    const getAttendanceStatus = (studentId, dateStr) => {
        const attendance = attendances.find(
            (att) => {
                const attDate = new Date(att.date).toISOString().split('T')[0];
                return att.student_id._id === studentId && attDate === dateStr;
            }
        );
        return attendance ? attendance.status : null;
    };

    // Get cell content (circle) based on attendance status
    const getCellContent = (status) => {
        if (!status) return '';
        return (
            <span className="inline-block w-4 h-4 rounded-full" style={{
                backgroundColor: status === 'present' ? '#22c55e' : status === 'absent' ? '#ef4444' : '#eab308',
            }}></span>
        );
    };

    // Get students for the selected group
    const getGroupStudentsList = () => {
        if (!selectedGroupId) return [];
        
        return groupStudents
            .filter(gs => gs.group_id._id === selectedGroupId && gs.student_id !== null)
            .map(gs => ({
                id: gs.student_id._id,
                name: `${gs.student_id.first_name} ${gs.student_id.last_name}`,
                phone: gs.student_id.phone
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

    const daysInMonth = getDaysInMonth();
    const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
    const currentMonthName = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    const groupStudentsList = getGroupStudentsList();

    return (
        <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-8xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                        Talabalar Davomati Boshqaruvi
                    </h1>
                  
                </div>

                {/* Group Selection and Month Navigation */}
                <div className={`flex items-center justify-between mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            className={`px-4 py-2 rounded-lg border ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                        >
                            <option value="">Guruhni tanlang</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={prevMonth}
                            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </motion.button>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {currentMonthName} {currentYear}
                        </h2>
                        <button
                            onClick={goToCurrentMonth}
                            className={`px-3 py-1 text-sm rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                        >
                            Joriy oy
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={nextMonth}
                            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </motion.button>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border-collapse">
                        <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-r border-gray-200`}>
                                    Talaba
                                </th>
                                {getDaysInMonth().map((day, index) => (
                                    <th
                                        key={index}
                                        scope="col"
                                        className={`px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-r border-gray-200`}
                                    >
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y divide-gray-200 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                            {getGroupStudentsList().map((student) => (
                                <tr key={student.id} className={isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}>
                                    <td
                                        className={`px-4 py-3 text-sm sticky left-0 z-10 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-900'} border-r border-gray-200`}
                                    >
                                        {student.name}
                                    </td>
                                    {getDaysInMonth().map((day, dayIndex) => {
                                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const status = getAttendanceStatus(student.id, dateStr);
                                        return (
                                            <td
                                                key={dayIndex}
                                                className={`px-4 py-3 text-sm text-center cursor-pointer ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} border-r border-gray-200`}
                                                onClick={() => handleOpenModal('create', null, { studentId: student.id, date: dateStr })}
                                            >
                                                {getCellContent(status)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div className={`mt-4 flex flex-wrap gap-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kelgan</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kelmagan</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kech kelgan</span>
                    </div>
                </div>
                {/* Snackbar */}
                {snackbar.open && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center justify-between ${
                            snackbar.severity === 'success'
                            ? isDarkMode
                                ? 'bg-green-600'
                                : 'bg-green-500'
                            : isDarkMode
                                ? 'bg-red-600'
                                : 'bg-red-500'
                        } text-white min-w-[200px]`}
                    >
                        <p>{snackbar.message}</p>
                        <button
                            onClick={handleCloseSnackbar}
                            className="ml-4 p-1 hover:bg-black/10 rounded-full transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5 text-white" />
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}