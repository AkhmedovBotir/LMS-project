'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { EyeIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function AttendanceManagement() {
    const { user, token } = useAuth();
    const { isDarkMode } = useTheme();
    const [attendances, setAttendances] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });
    const [openModal, setOpenModal] = useState(false);
    const [currentAttendance, setCurrentAttendance] = useState(null);
    const [currentAction, setCurrentAction] = useState(null); // 'view', 'edit', 'create', 'delete'
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Month navigation
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCell, setSelectedCell] = useState(null); // {employeeId, date}

    // Form state
    const [formData, setFormData] = useState({
        employee_id: '',
        date: '',
        check_in: '',
        check_out: '',
        status: 'present',
        note: ''
    });

    useEffect(() => {
        if (token) {
            fetchAttendances();
            fetchEmployees();
        }
    }, [token, currentDate, pagination.currentPage]);

    const fetchAttendances = async () => {
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const queryParams = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                date: `${year}-${month.toString().padStart(2, '0')}-01`
            });

            const response = await fetch(`http://localhost:5000/api/attendances?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                setAttendances(result.data || []);
                setPagination({
                    ...pagination,
                    total: result.pagination?.total || 0,
                    totalPages: result.pagination?.total_pages || 1,
                    currentPage: result.pagination?.page || 1,
                    limit: result.pagination?.limit || 10
                });
            } else {
                setError(result.message || 'Davomat ma\'lumotlarini yuklashda xatolik');
                setAttendances([]);
            }
        } catch (err) {
            console.error('Error fetching attendances:', err);
            setError('Davomat ma\'lumotlarini yuklashda xatolik');
            setAttendances([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/employees?page=${pagination.currentPage}&limit=${pagination.limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Xodimlarni yuklashda xatolik');
            }

            const result = await response.json();
            
            if (result.success) {
                setEmployees(result.data || []);
                setPagination({
                    ...pagination,
                    total: result.pagination?.total || 0,
                    totalPages: result.pagination?.totalPages || 1,
                    currentPage: result.pagination?.page || 1,
                    limit: result.pagination?.limit || 10
                });
            } else {
                throw new Error(result.message || 'Xodimlar ma\'lumotlari noto\'g\'ri formatda');
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError(err.message || 'Xodimlarni yuklashda xatolik');
            setEmployees([]);
        }
    };

    const handleOpenModal = (action, attendance = null, cellData = null) => {
        setCurrentAction(action);
        setCurrentAttendance(null);
        setSelectedCell(null);
        
        if (cellData) {
            const [year, month, day] = cellData.date.split('-');
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            
            setSelectedCell({ 
                employeeId: cellData.employeeId, 
                date: formattedDate
            });

            const existingAttendance = attendances.find(att => {
                const attDate = new Date(att.date).toISOString().split('T')[0];
                return att.employee_id._id === cellData.employeeId && attDate === formattedDate;
            });
            
            if (existingAttendance) {
                setCurrentAttendance(existingAttendance);
                setFormData({
                    employee_id: existingAttendance.employee_id._id,
                    date: existingAttendance.date,
                    check_in: existingAttendance.check_in ? new Date(existingAttendance.check_in).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '',
                    check_out: existingAttendance.check_out ? new Date(existingAttendance.check_out).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '',
                    status: existingAttendance.status || 'present',
                    note: existingAttendance.note || ''
                });
            } else {
                setFormData({
                    employee_id: cellData.employeeId,
                    date: formattedDate,
                    check_in: '',
                    check_out: '',
                    status: 'present',
                    note: ''
                });
            }
        } else if (action === 'create') {
            setFormData({
                employee_id: '',
                date: '',
                check_in: '',
                check_out: '',
                status: 'present',
                note: ''
            });
        }
        
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentAction(null);
        setCurrentAttendance(null);
        setSelectedCell(null);
        setFormData({
            employee_id: '',
            date: '',
            check_in: '',
            check_out: '',
            status: 'present',
            note: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.employee_id || !formData.date || !formData.status) {
                throw new Error('Xodim, sana va status tanlanishi shart');
            }

            const formattedData = {
                employee_id: formData.employee_id,
                date: formData.date,
                check_in: formData.check_in ? `${formData.date}T${formData.check_in}:00.000Z` : null,
                check_out: formData.check_out ? `${formData.date}T${formData.check_out}:00.000Z` : null,
                status: formData.status,
                note: formData.note || null
            };

            let response;
            let successMessage = '';

            if (currentAction === 'edit' && currentAttendance) {
                response = await fetch(`http://localhost:5000/api/attendances/${currentAttendance._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(formattedData),
                });
                successMessage = 'Davomat yangilandi';
            } else {
                response = await fetch('http://localhost:5000/api/attendances', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(formattedData),
                });
                successMessage = 'Davomat muvaffaqiyatli yaratildi';
            }

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || successMessage,
                    severity: 'success',
                });
                fetchAttendances();
                handleCloseModal();
            } else {
                throw new Error(result.message || 'Davomatni saqlashda xatolik');
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Davomatni saqlashda xatolik',
                severity: 'error',
            });
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/attendances/${currentAttendance._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || 'Davomat muvaffaqiyatli o\'chirildi',
                    severity: 'success',
                });
                fetchAttendances();
                handleCloseModal();
            } else {
                throw new Error(result.message || 'Davomatni o\'chirishda xatolik');
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Davomatni o\'chirishda xatolik',
                severity: 'error',
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
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
        
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            // Format date as YYYY-MM-DD
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            days.push({
                date: date,
                dateStr: dateStr
            });
        }
        
        return days;
    };

    // Get attendance status for a specific employee and date
    const getAttendanceStatus = (employeeId, dateStr) => {
        const attendance = attendances.find(att => {
            const attDate = new Date(att.date).toISOString().split('T')[0];
            return att.employee_id._id === employeeId && attDate === dateStr;
        });
        return attendance?.status || null;
    };

    // Get cell color based on attendance status
    const getCellColor = (status) => {
        if (!status) return isDarkMode ? 'bg-gray-800' : 'bg-white';
        
        switch (status) {
            case 'present': return 'bg-green-500';
            case 'absent': return 'bg-red-500';
            case 'late': return 'bg-yellow-500';
            case 'on_leave': return 'bg-blue-500';
            default: return isDarkMode ? 'bg-gray-800' : 'bg-white';
        }
    };

    // Add pagination controls
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
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

    return (
        <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-8xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                        Davomat Boshqaruvi
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal('create')}
                        className={`flex items-center px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                    >
                        Davomat Qo'shish
                    </motion.button>
                </div>

                {/* Month Navigation */}
                <div className={`flex items-center justify-between mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevMonth}
                        className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </motion.button>
                    
                    <div className="flex items-center space-x-4">
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {currentMonthName} {currentYear}
                        </h2>
                        <button
                            onClick={goToCurrentMonth}
                            className={`px-3 py-1 text-sm rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                        >
                            Joriy oy
                        </button>
                    </div>
                    
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextMonth}
                        className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </motion.button>
                </div>

                {/* Attendance Table */}
                <div className={`rounded-xl shadow-lg overflow-auto backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/80 border border-gray-200/50'}`}>
                    <div className="min-w-full">
                        <table className="w-full">
                            <thead>
                                <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                    <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} sticky left-0 z-20 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        Xodim
                                    </th>
                                    {daysInMonth.map((day, index) => (
                                        <th 
                                            key={index}
                                            className={`px-2 py-3 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ${day.date.getDay() === 0 || day.date.getDay() === 6 ? isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100/50' : ''}`}
                                        >
                                            {day.date.getDate()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee) => (
                                    <tr 
                                        key={employee.id}
                                        className={isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}
                                    >
                                        <td 
                                            className={`px-4 py-3 text-sm sticky left-0 z-10 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-900'}`}
                                        >
                                            {employee.first_name} {employee.last_name}
                                        </td>
                                        {daysInMonth.map((day, dayIndex) => {
                                            const status = getAttendanceStatus(employee.id, day.dateStr);
                                            
                                            return (
                                                <td 
                                                    key={dayIndex}
                                                    className={`px-2 py-3 text-center cursor-pointer ${getCellColor(status)} ${day.date.getDay() === 0 || day.date.getDay() === 6 ? isDarkMode ? 'bg-opacity-70' : 'bg-opacity-50' : ''}`}
                                                    onClick={() => {
                                                        setSelectedCell({ employeeId: employee.id, date: day.dateStr });
                                                        handleOpenModal('edit', null, { employeeId: employee.id, date: day.dateStr });
                                                    }}
                                                >
                                                    <span className="text-xs text-white">
                                                        {status === 'present' ? 'P' :
                                                         status === 'absent' ? 'A' :
                                                         status === 'late' ? 'L' :
                                                         status === 'on_leave' ? 'O' : ''}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination - Make it sticky */}
                        <div className={`px-6 py-4 flex items-center justify-between border-t sticky bottom-0 z-20 ${
                            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                Jami {employees.length} ta xodim
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
                </div>

                {/* Legend */}
                <div className={`mt-4 flex flex-wrap gap-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 mr-2"></div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ishda</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 mr-2"></div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Yo'q</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kech kelgan</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 mr-2"></div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ta'til</span>
                    </div>
                </div>

                {/* Modal for Create/Edit/View/Delete */}
                {openModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    >
                        <div className={`rounded-xl p-8 w-full max-w-lg max-h-[80vh] overflow-y-auto backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                            {/* Modal Header */}
                            <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                                {currentAction === 'create' && 'Yangi Davomat Qo\'shish'}
                                {currentAction === 'edit' && 'Davomatni Tahrirlash'}
                                {currentAction === 'view' && 'Davomat Ma\'lumotlari'}
                                {currentAction === 'delete' && 'Davomatni O\'chirish'}
                            </h2>

                            {/* Delete Confirmation */}
                            {currentAction === 'delete' && (
                                <div>
                                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Siz haqiqatan ham ushbu davomat yozuvini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
                                    </p>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={handleCloseModal}
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
                            )}

                            {/* View Mode */}
                            {currentAction === 'view' && currentAttendance && (
                                <div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Xodim</p>
                                            <p className={`mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                {employees.find(emp => emp.id === currentAttendance.employee_id._id)?.first_name || 'N/A'} 
                                                {' '}
                                                {employees.find(emp => emp.id === currentAttendance.employee_id._id)?.last_name || ''}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sana</p>
                                            <p className={`mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                {currentAttendance.date}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kirish Vaqti</p>
                                            <p className={`mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                {currentAttendance.check_in || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Chiqish Vaqti</p>
                                            <p className={`mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                {currentAttendance.check_out || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Holati</p>
                                            <p className={`mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                {currentAttendance.status === 'present' ? 'Ishda' :
                                                 currentAttendance.status === 'absent' ? 'Yo\'q' :
                                                 currentAttendance.status === 'late' ? 'Kech kelgan' :
                                                 currentAttendance.status === 'on_leave' ? 'Ta\'til' : 'Noma\'lum'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <button
                                            onClick={handleCloseModal}
                                            className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                                        >
                                            Yopish
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Create/Edit Form */}
                            {(currentAction === 'create' || currentAction === 'edit') && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Xodim
                                        </label>
                                        <select
                                            name="employee_id"
                                            value={formData.employee_id}
                                            onChange={handleInputChange}
                                            required
                                            disabled={selectedCell !== null} // Disable if editing from cell click
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-70`}
                                        >
                                            <option value="">Xodimni tanlang</option>
                                            {employees.map((emp) => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.first_name} {emp.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Sana
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            required
                                            disabled={selectedCell !== null} // Disable if editing from cell click
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-70`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Kirish Vaqti
                                        </label>
                                        <input
                                            type="time"
                                            name="check_in"
                                            value={formData.check_in}
                                            onChange={handleInputChange}
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Chiqish Vaqti
                                        </label>
                                        <input
                                            type="time"
                                            name="check_out"
                                            value={formData.check_out}
                                            onChange={handleInputChange}
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
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
                                            <option value="present">Ishda</option>
                                            <option value="absent">Yo'q</option>
                                            <option value="late">Kech kelgan</option>
                                            <option value="on_leave">Ta'til</option>
                                        </select>
                                    </div>

                                    {/* Notes field - only show for specific statuses */}
                                    {(formData.status === 'absent' || formData.status === 'late' || formData.status === 'on_leave') && (
                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Izoh
                                            </label>
                                            <textarea
                                                name="note"
                                                value={formData.note}
                                                onChange={handleInputChange}
                                                placeholder="Izoh kiriting..."
                                                className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                                rows="3"
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-3 mt-8">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                                        >
                                            Bekor Qilish
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="submit"
                                            className={`px-6 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                                        >
                                            {currentAction === 'edit' ? 'Yangilash' : 'Yaratish'}
                                        </motion.button>
                                        {currentAction === 'edit' && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="button"
                                                onClick={() => setCurrentAction('delete')}
                                                className={`px-6 py-2 rounded-lg text-white ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}`}
                                            >
                                                O'chirish
                                            </motion.button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}

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