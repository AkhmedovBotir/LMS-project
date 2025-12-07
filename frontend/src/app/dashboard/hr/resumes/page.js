'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { EyeIcon, PencilIcon, TrashIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Switch from '@mui/material/Switch';

export default function ResumeManagement() {
    const { user, token } = useAuth();
    const { isDarkMode } = useTheme();
    const [resumes, setResumes] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentResume, setCurrentResume] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });
    const [filters, setFilters] = useState({
        status: '',
        search: ''
    });
    const [userTypes, setUserTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        birth_date: '',
        address: '',
        education: [],
        experience: [],
        skills: [],
        languages: [],
        certifications: [],
        additional_info: [],
        employee_id: ''
    });

    useEffect(() => {
        if (token) {
            fetchResumes();
            fetchEmployees();
            fetchUserTypes();
            fetchDepartments();
            fetchPositions();
        }
    }, [token]);

    const fetchResumes = async () => {
        try {
            const queryParams = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                status: filters.status
            });

            console.log('Fetching resumes with params:', queryParams.toString());

            const response = await fetch(`http://localhost:5000/api/resumes?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response data:', result);

            if (response.ok) {
                if (result.success && result.data) {
                    setResumes(result.data.resumes || []);
                    setPagination({
                        ...pagination,
                        total: result.data.pagination?.total || 0,
                        totalPages: result.data.pagination?.pages || 1,
                        currentPage: result.data.pagination?.page || 1,
                        limit: result.data.pagination?.limit || 10
                    });
            } else {
                    console.error('Invalid response structure:', result);
                    setError('Serverdan noto\'g\'ri formatda javob keldi');
                    setResumes([]);
                }
            } else {
                console.error('API Error:', result);
                setError(result.message || 'Rezumelarni yuklashda xatolik');
                setResumes([]);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Rezumelarni yuklashda xatolik yuz berdi');
            setResumes([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/employees', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setEmployees(Array.isArray(data.data) ? data.data : []);
            } else {
                setError(data.message || 'Xodimlarni yuklashda xatolik');
                setEmployees([]);
            }
        } catch (err) {
            setError('Xodimlarni yuklashda xatolik');
            setEmployees([]);
        }
    };

    const fetchUserTypes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user-types', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setUserTypes(result.data || []);
            } else {
                console.error('User types yuklashda xatolik:', result.message);
            }
        } catch (err) {
            console.error('User types yuklashda xatolik:', err);
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
                console.error('Departments yuklashda xatolik:', result.message);
            }
        } catch (err) {
            console.error('Departments yuklashda xatolik:', err);
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
                console.error('Positions yuklashda xatolik:', result.message);
            }
        } catch (err) {
            console.error('Positions yuklashda xatolik:', err);
        }
    };

    const handleOpenCreateDialog = () => {
        setCurrentResume(null);
        setFormData({
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
            birth_date: '',
            address: '',
            education: [],
            experience: [],
            skills: [],
            languages: [],
            certifications: [],
            additional_info: [],
            employee_id: ''
        });
        setOpenCreateDialog(true);
    };

    const handleOpenEditDialog = (resume) => {
        setCurrentResume(resume);
        setFormData({
            first_name: resume.first_name,
            last_name: resume.last_name,
            phone: resume.phone,
            email: resume.email,
            birth_date: resume.birth_date,
            address: resume.address,
            education: resume.education || [],
            experience: resume.experience || [],
            skills: resume.skills || [],
            languages: resume.languages || [],
            certifications: resume.certifications || [],
            additional_info: resume.additional_info || [],
            employee_id: resume.employee_id
        });
        setOpenEditDialog(true);
    };

    const handleOpenViewDialog = (resume) => {
        setCurrentResume(resume);
        setOpenViewDialog(true);
    };

    const handleOpenDeleteDialog = (resume) => {
        // Ensure we're only storing necessary data
        const resumeToDelete = {
            id: resume.id,
            employee_id: resume.employee_id,
            status: resume.status
        };
        setCurrentResume(resumeToDelete);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenCreateDialog(false);
        setOpenEditDialog(false);
        setOpenViewDialog(false);
        setOpenDeleteDialog(false);
        setCurrentResume(null);
    };

    const handleInputChange = (e, section, index, field) => {
        if (section) {
            setFormData(prev => {
                const newData = { ...prev };
                if (field) {
                    // For nested objects like education and experience
                    newData[section] = prev[section].map((item, i) => {
                        if (i === index) {
                            return { ...item, [field]: e.target.value };
                        }
                        return item;
                    });
                } else {
                    // For simple arrays like skills and languages
                    newData[section] = prev[section].map((item, i) => {
                        if (i === index) {
                            return e.target.value;
                        }
                        return item;
                    });
                }
                return newData;
            });
        } else {
            // For simple fields
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const addField = (section) => {
        setFormData(prev => {
            const newData = { ...prev };
            switch(section) {
                case 'education':
                    newData.education = [...prev.education, { institution: '', degree: '', start_date: '', end_date: '', description: '' }];
                    break;
                case 'experience':
                    newData.experience = [...prev.experience, { company: '', position: '', start_date: '', end_date: '', description: '' }];
                    break;
                case 'skills':
                    newData.skills = [...prev.skills, ''];
                    break;
                case 'languages':
                    newData.languages = [...prev.languages, ''];
                    break;
                case 'certifications':
                    newData.certifications = [...prev.certifications, { name: '', year: '' }];
                    break;
                case 'additional_info':
                    newData.additional_info = [...prev.additional_info, ''];
                    break;
            }
            return newData;
        });
    };

    const removeField = (section, index) => {
        setFormData(prev => {
            const newData = { ...prev };
            newData[section] = prev[section].filter((_, i) => i !== index);
            return newData;
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            if (!formData.employee_id) {
                throw new Error('Xodim tanlanishi shart');
            }

            const response = await fetch('http://localhost:5000/api/resumes', {
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
                    message: 'Rezume muvaffaqiyatli yaratildi',
                    severity: 'success',
                });
                fetchResumes();
                handleCloseDialog();
            } else {
                throw new Error(result.message || 'Rezume yaratishda xatolik');
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
            if (!formData.employee_id) {
                throw new Error('Xodim tanlanishi shart');
            }

            const response = await fetch(`http://localhost:5000/api/resumes/${currentResume.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    status: currentResume.status
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: 'Rezume muvaffaqiyatli yangilandi',
                    severity: 'success',
                });
                fetchResumes();
                handleCloseDialog();
            } else {
                throw new Error(result.message || 'Rezume yangilashda xatolik');
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
            const response = await fetch(`http://localhost:5000/api/resumes/${currentResume.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSnackbar({
                    open: true,
                    message: 'Rezume muvaffaqiyatli o\'chirildi',
                    severity: 'success',
                });
                fetchResumes();
                handleCloseDialog();
            } else {
                throw new Error(result.message || 'Rezume o\'chirishda xatolik');
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Xatolik yuz berdi',
                severity: 'error',
            });
        }
    };

    const handleExport = async (resumeId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/resumes/${resumeId}/export`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resume_${resumeId}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
                setSnackbar({
                    open: true,
                    message: 'Rezume PDF sifatida yuklab olindi',
                    severity: 'success',
                });
            } else {
                const result = await response.json();
                throw new Error(result.message || 'Rezume eksport qilishda xatolik');
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

    // Add new education item
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
                        Rezumelar Boshqaruvi
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenCreateDialog}
                        className={`flex items-center px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                    >
                        Rezume Qo'shish
                    </motion.button>
                </div>

                <div className={`rounded-xl shadow-lg overflow-hidden backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/80 border border-gray-200/50'}`}>
                    <table className="w-full">
                        <thead>
                            <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Xodim Ismi</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ish Tajribasi</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Harakatlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(resumes) && resumes.map((resume) => (
                                <motion.tr
                                    key={resume.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}
                                >
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {employees.find(emp => emp.id === resume.employee_id)?.first_name || 'N/A'} {employees.find(emp => emp.id === resume.employee_id)?.last_name || ''}
                                    </td>
                                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {resume.experience.length > 0 ? resume.experience[0].company + ' - ' + resume.experience[0].position : 'Tajriba yo\'q'}
                                    </td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenViewDialog(resume)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenEditDialog(resume)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-yellow-600 hover:bg-gray-100'}`}
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleOpenDeleteDialog(resume)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleExport(resume.id)}
                                            className={`p-2 rounded-full ${isDarkMode ? 'text-green-400 hover:bg-gray-700' : 'text-green-600 hover:bg-gray-100'}`}
                                        >
                                            <DocumentArrowDownIcon className="h-5 w-5" />
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Yangi Rezume Qo'shish Dialogi */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openCreateDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openCreateDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Yangi Rezume Qo'shish
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-6 flex flex-col">
                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Asosiy Ma'lumotlar</h3>
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Xodim
                                    </label>
                                    <select
                                        name="employee_id"
                                        value={formData.employee_id}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    >
                                        <option value="">Xodimni tanlang</option>
                                        {Array.isArray(employees) && employees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.first_name} {emp.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ta'lim</h3>
                                {formData.education.map((edu, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={(e) => handleInputChange(e, 'education', index, 'institution')}
                                            placeholder="Muassasa"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => handleInputChange(e, 'education', index, 'degree')}
                                            placeholder="Daraja"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={edu.year}
                                                onChange={(e) => handleInputChange(e, 'education', index, 'year')}
                                                placeholder="Yil"
                                                className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                            {formData.education.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('education', index)}
                                                    className={`text-red-500 hover:text-red-600`}
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('education')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi ta'lim qo'shish
                                </button>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ish Tajribasi</h3>
                                {formData.experience.map((exp, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                        <input
                                            type="text"
                                            value={exp.company}
                                            onChange={(e) => handleInputChange(e, 'experience', index, 'company')}
                                            placeholder="Kompaniya"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        <input
                                            type="text"
                                            value={exp.position}
                                            onChange={(e) => handleInputChange(e, 'experience', index, 'position')}
                                            placeholder="Lavozim"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={exp.years}
                                                onChange={(e) => handleInputChange(e, 'experience', index, 'years')}
                                                placeholder="Yillar"
                                                className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                            {formData.experience.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('experience', index)}
                                                    className={`text-red-500 hover:text-red-600`}
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('experience')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi tajriba qo'shish
                                </button>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ko'nikmalar</h3>
                                {formData.skills.map((skill, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={skill}
                                            onChange={(e) => handleInputChange(e, 'skills', index)}
                                            placeholder="Ko'nikma"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        {formData.skills.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeField('skills', index)}
                                                className={`text-red-500 hover:text-red-600`}
                                            >
                                                X
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('skills')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi ko'nikma qo'shish
                                </button>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tillar</h3>
                                {formData.languages.map((lang, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={lang}
                                            onChange={(e) => handleInputChange(e, 'languages', index)}
                                            placeholder="Til"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        {formData.languages.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeField('languages', index)}
                                                className={`text-red-500 hover:text-red-600`}
                                            >
                                                X
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('languages')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi til qo'shish
                                </button>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sertifikatlar</h3>
                                {formData.certifications.map((cert, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                        <input
                                            type="text"
                                            value={cert.name}
                                            onChange={(e) => handleInputChange(e, 'certifications', index, 'name')}
                                            placeholder="Sertifikat nomi"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={cert.year}
                                                onChange={(e) => handleInputChange(e, 'certifications', index, 'year')}
                                                placeholder="Yil"
                                                className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                            {formData.certifications.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('certifications', index)}
                                                    className={`text-red-500 hover:text-red-600`}
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('certifications')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi sertifikat qo'shish
                                </button>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Qo'shimcha Ma'lumotlar</h3>
                                {formData.additional_info.map((info, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={info}
                                            onChange={(e) => handleInputChange(e, 'additional_info', index)}
                                            placeholder="Ma'lumot"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        {formData.additional_info.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeField('additional_info', index)}
                                                className={`text-red-500 hover:text-red-600`}
                                            >
                                                X
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('additional_info')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi ma'lumot qo'shish
                                </button>
                            </div>

                            <div className="flex justify-end space-x-3 mt-8">
                                <button
                                    type="button"
                                    onClick={handleCloseDialog}
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
                                    Yaratish
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Rezume Tahrirlash Dialogi */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openEditDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openEditDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Rezume Tahrirlash
                        </h2>
                        <form onSubmit={handleUpdate} className="space-y-6 flex flex-col">
                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Asosiy Ma'lumotlar</h3>
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Xodim
                                    </label>
                                    <select
                                        name="employee_id"
                                        value={formData.employee_id}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                    >
                                        <option value="">Xodimni tanlang</option>
                                        {Array.isArray(employees) && employees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.first_name} {emp.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ta'lim</h3>
                                {formData.education.map((edu, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={(e) => handleInputChange(e, 'education', index, 'institution')}
                                            placeholder="Muassasa"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => handleInputChange(e, 'education', index, 'degree')}
                                            placeholder="Daraja"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={edu.year}
                                                onChange={(e) => handleInputChange(e, 'education', index, 'year')}
                                                placeholder="Yil"
                                                className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                            {formData.education.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('education', index)}
                                                    className={`text-red-500 hover:text-red-600`}
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('education')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi ta'lim qo'shish
                                </button>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ish Tajribasi</h3>
                                {formData.experience.map((exp, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                        <input
                                            type="text"
                                            value={exp.company}
                                            onChange={(e) => handleInputChange(e, 'experience', index, 'company')}
                                            placeholder="Kompaniya"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        <input
                                            type="text"
                                            value={exp.position}
                                            onChange={(e) => handleInputChange(e, 'experience', index, 'position')}
                                            placeholder="Lavozim"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={exp.years}
                                                onChange={(e) => handleInputChange(e, 'experience', index, 'years')}
                                                placeholder="Yillar"
                                                className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                            {formData.experience.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('experience', index)}
                                                    className={`text-red-500 hover:text-red-600`}
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('experience')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi tajriba qo'shish
                                </button>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ko'nikmalar</h3>
                                {formData.skills.map((skill, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={skill}
                                            onChange={(e) => handleInputChange(e, 'skills', index)}
                                            placeholder="Ko'nikma"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        {formData.skills.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeField('skills', index)}
                                                className={`text-red-500 hover:text-red-600`}
                                            >
                                                X
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('skills')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi ko'nikma qo'shish
                                </button>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tillar</h3>
                                {formData.languages.map((lang, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={lang}
                                            onChange={(e) => handleInputChange(e, 'languages', index)}
                                            placeholder="Til"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        {formData.languages.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeField('languages', index)}
                                                className={`text-red-500 hover:text-red-600`}
                                            >
                                                X
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('languages')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi til qo'shish
                                </button>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sertifikatlar</h3>
                                {formData.certifications.map((cert, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                        <input
                                            type="text"
                                            value={cert.name}
                                            onChange={(e) => handleInputChange(e, 'certifications', index, 'name')}
                                            placeholder="Sertifikat nomi"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={cert.year}
                                                onChange={(e) => handleInputChange(e, 'certifications', index, 'year')}
                                                placeholder="Yil"
                                                className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                            />
                                            {formData.certifications.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('certifications', index)}
                                                    className={`text-red-500 hover:text-red-600`}
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('certifications')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi sertifikat qo'shish
                                </button>
                            </div>

                            <div>
                                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Qo'shimcha Ma'lumotlar</h3>
                                {formData.additional_info.map((info, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={info}
                                            onChange={(e) => handleInputChange(e, 'additional_info', index)}
                                            placeholder="Ma'lumot"
                                            className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                                        />
                                        {formData.additional_info.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeField('additional_info', index)}
                                                className={`text-red-500 hover:text-red-600`}
                                            >
                                                X
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addField('additional_info')}
                                    className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-500' : 'text-yellow-600 hover:text-yellow-700'}`}
                                >
                                    + Yangi ma'lumot qo'shish
                                </button>
                            </div>

                            <div className="flex justify-end space-x-3 mt-8">
                                <button
                                    type="button"
                                    onClick={handleCloseDialog}
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
                                    Yangilash
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Rezume Ma'lumotlari Dialogi */}
                <motion.div
                    variants={dialogVariants}
                    initial="hidden"
                    animate={openViewDialog ? "visible" : "hidden"}
                    exit="exit"
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${!openViewDialog && 'hidden'}`}
                >
                    <div className={`rounded-xl p-6 w-full max-w-md backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                            Rezume Ma'lumotlari
                        </h2>
                        {currentResume && (
                            <div className="space-y-4">
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">To'liq ism:</span> {currentResume.full_name}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Telefon:</span> {currentResume.phone}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Email:</span> {currentResume.email}
                                </p>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Manzil:</span> {currentResume.address}
                                    </p>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Tug'ilgan sana:</span> {new Date(currentResume.birth_date).toLocaleDateString()}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Jins:</span> {currentResume.gender}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Ma'lumoti:</span> {currentResume.education}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Mutaxassislik:</span> {currentResume.specialization}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Ish tajribasi:</span> {currentResume.experience} yil
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Maosh:</span> {currentResume.salary} so'm
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Holati:</span> {currentResume.status}
                                </p>
                                {currentResume.skills && currentResume.skills.length > 0 && (
                                    <div>
                                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ko'nikmalar:</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {currentResume.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        isDarkMode
                                                            ? 'bg-gray-700 text-gray-300'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {currentResume.certifications && currentResume.certifications.length > 0 && (
                                    <div>
                                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sertifikatlar:</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                        {currentResume.certifications.map((cert, index) => (
                                                <span
                                                    key={index}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        isDarkMode
                                                            ? 'bg-blue-900 text-blue-200'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}
                                                >
                                                    {cert}
                                                </span>
                                        ))}
                                        </div>
                                    </div>
                                )}
                                {currentResume.languages && currentResume.languages.length > 0 && (
                                    <div>
                                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tillar:</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {currentResume.languages.map((lang, index) => (
                                                <span
                                                    key={index}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        isDarkMode
                                                            ? 'bg-purple-900 text-purple-200'
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}
                                                >
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {currentResume.about && (
                                    <div>
                                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>O'zim haqimda:</p>
                                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {currentResume.about}
                                            </p>
                                    </div>
                                )}
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
                            Siz haqiqatan ham ushbu rezumeni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
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