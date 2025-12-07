'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { EyeIcon, PencilIcon, TrashIcon, PhoneIcon, AcademicCapIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';

// Add the ConvertDialog component before the main ReceptionPage component
const GroupDialog = ({ isOpen, onClose, onSubmit, loading, error, isDarkMode }) => {
  const [groupData, setGroupData] = useState({
    name: '',
    description: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`relative rounded-xl p-6 w-full max-w-md mx-4 backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
              Yangi guruh qo'shish
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Guruh nomi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupData.name}
                onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                className={`mt-1 w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                placeholder="Guruh nomi"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tavsif
              </label>
              <textarea
                value={groupData.description}
                onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                className={`mt-1 w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                placeholder="Guruh haqida ma'lumot"
                rows={3}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/50">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
            >
              Bekor qilish
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSubmit(groupData)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const ConvertDialog = ({ isOpen, onClose, onSubmit, loading, error, studentData, setStudentData, groups, isDarkMode }) => {
  const [validationError, setValidationError] = useState('');
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState('');
  const [showStudentForm, setShowStudentForm] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setValidationError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleGroupSelect = (groupId) => {
    setStudentData({ ...studentData, groupId });
    setShowStudentForm(true);
  };

  const handleSubmit = () => {
    // Validate all required fields
    const requiredFields = {
      birth_date: 'Tug\'ilgan sana',
      address: 'Manzil',
      gender: 'Jins',
      trial_lesson_date: 'Sinov darsi sanasi'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!studentData[field]) {
        setValidationError(`${label} maydonini to'ldiring`);
        return;
      }
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(studentData.birth_date)) {
      setValidationError('Tug\'ilgan sana noto\'g\'ri formatda. Namuna: 2000-01-01');
      return;
    }

    if (!dateRegex.test(studentData.trial_lesson_date)) {
      setValidationError('Sinov darsi sanasi noto\'g\'ri formatda. Namuna: 2024-03-20');
      return;
    }

    setValidationError('');
    onSubmit();
  };

  const handleCreateGroup = async (groupData) => {
    try {
      setGroupLoading(true);
      setGroupError('');
      
      const response = await axios.post(
        'http://localhost:5000/api/groups',
        groupData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        // Refresh groups list
        const groupsResponse = await axios.get('http://localhost:5000/api/groups', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (groupsResponse.data.success) {
          // Update the groups list in the parent component
          setGroups(groupsResponse.data.data);
          // Select the newly created group
          handleGroupSelect(response.data.data._id);
        }
        setOpenGroupDialog(false);
      }
    } catch (error) {
      setGroupError(error.response?.data?.message || 'Guruh yaratishda xatolik yuz berdi');
    } finally {
      setGroupLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative rounded-xl p-6 w-full max-w-md mx-4 backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                {showStudentForm ? 'O\'quvchiga aylantirish' : 'Guruhni tanlang'}
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {!showStudentForm ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Mavjud guruhlar
                  </h4>

                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {groups.map((group) => (
                    <button
                      key={group._id}
                      onClick={() => handleGroupSelect(group._id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        isDarkMode
                          ? 'hover:bg-gray-700/50 border border-gray-700/50'
                          : 'hover:bg-gray-50 border border-gray-200/50'
                      }`}
                    >
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {group.name}
                      </div>
                      {group.description && (
                        <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {group.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tug'ilgan sana <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={studentData.birth_date || ''}
                    onChange={(e) => {
                      setStudentData({ ...studentData, birth_date: e.target.value });
                      setValidationError('');
                    }}
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Manzil <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentData.address || ''}
                    onChange={(e) => {
                      setStudentData({ ...studentData, address: e.target.value });
                      setValidationError('');
                    }}
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    placeholder="Manzil"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Jins <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={studentData.gender || ''}
                    onChange={(e) => {
                      setStudentData({ ...studentData, gender: e.target.value });
                      setValidationError('');
                    }}
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
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
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sinov darsi sanasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="trial_lesson_date"
                    value={studentData.trial_lesson_date}
                    onChange={(e) => setStudentData({ ...studentData, trial_lesson_date: e.target.value })}
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>
              </div>
            )}

            {validationError && (
              <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/50">
                <p className="text-sm text-red-700 dark:text-red-200">{validationError}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={showStudentForm ? () => setShowStudentForm(false) : onClose}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                {showStudentForm ? 'Orqaga' : 'Bekor qilish'}
              </button>
              {showStudentForm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <GroupDialog
        isOpen={openGroupDialog}
        onClose={() => setOpenGroupDialog(false)}
        onSubmit={handleCreateGroup}
        loading={groupLoading}
        error={groupError}
        isDarkMode={isDarkMode}
      />
    </>
  );
};

const CreateDialog = ({ isOpen, onClose, onSubmit, loading, error, formData, setFormData, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`relative w-full max-w-2xl mx-4 my-8 rounded-2xl shadow-2xl border-2 p-0 overflow-hidden
            ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b
            ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>Yangi mehmon qo'shish</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <form className="px-8 py-6 space-y-8">
            {/* Asosiy ma'lumotlar */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Asosiy ma'lumotlar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Familiya</label>
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    placeholder="Familiya"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ism</label>
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    placeholder="Ism"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Telefon raqami <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    placeholder="+998XXXXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ota-ona telefon raqami</label>
                  <input
                    type="tel"
                    value={formData.parent_phone || ''}
                    onChange={e => setFormData({ ...formData, parent_phone: e.target.value })}
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    placeholder="+998XXXXXXXXX (ixtiyoriy)"
                  />
                </div>
              </div>
            </div>
            {/* Qayerdan eshitdi? */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Qayerdan eshitdi?</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { value: 'banner', label: 'Banner' },
                  { value: 'flyer', label: 'Flyer' },
                  { value: 'friends', label: "Do'stlar" },
                  { value: 'relatives', label: 'Qarindoshlar' },
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'telegram', label: 'Telegram' },
                  { value: 'other', label: 'Boshqa' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, how_came: opt.value, how_came_other: '' })}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                      ${formData.how_came === opt.value
                        ? isDarkMode
                          ? 'bg-yellow-600 text-white border-yellow-600'
                          : 'bg-yellow-500 text-white border-yellow-500'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {formData.how_came === 'other' && (
                <div className="mt-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Boshqa (izoh)</label>
                  <input
                    type="text"
                    value={formData.how_came_other || ''}
                    onChange={e => setFormData({ ...formData, how_came_other: e.target.value })}
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    placeholder="Qayerdan eshitdi?"
                  />
                </div>
              )}
            </div>
            {/* Qo'shimcha ma'lumotlar */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Qo'shimcha ma'lumotlar</h3>
              <textarea
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className={`mt-1 w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                placeholder="Qo'shimcha ma'lumotlar"
                rows={3}
              />
            </div>
            {error && (
              <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/50">
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={onClose}
                type="button"
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Bekor qilish
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSubmit}
                type="button"
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Saqlanmoqda...' : 'Saqlash'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

const ContactDialog = ({ isOpen, onClose, onSubmit, loading, error, contactData, setContactData, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`relative rounded-xl p-6 w-full max-w-md mx-4 backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
              Aloqa qilish
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Aloqa qilish haqida ma'lumot
              </label>
              <textarea
                value={contactData.contactNotes || ''}
                onChange={(e) => setContactData({ ...contactData, contactNotes: e.target.value })}
                className={`mt-1 w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                placeholder="Aloqa qilish haqida ma'lumot"
                rows={4}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/50">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
            >
              Bekor qilish
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSubmit}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const ViewDialog = ({ isOpen, onClose, reception, isDarkMode }) => {
  if (!isOpen || !reception) return null;

  const howCameLabels = {
    banner: 'Banner',
    flyer: 'Flyer',
    friends: "Do'stlar",
    relatives: 'Qarindoshlar',
    instagram: 'Instagram',
    telegram: 'Telegram',
    other: 'Boshqa',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`relative rounded-xl p-6 w-full max-w-2xl mx-4 backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
              Mehmon ma'lumotlari
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>F.I.O</label>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reception.last_name} {reception.first_name}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Telefon</label>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reception.phone}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jins</label>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reception.gender === 'male' ? 'Erkak' : 'Ayol'}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reception.status === 'o\'quvchi' ? 'O\'quvchi' : reception.status === 'sinov' ? 'Sinov' : reception.status === 'bekor' ? 'Bekor' : reception.status}</p>
              </div>
            </div>

            {/* Qayerdan eshitdi */}
            {reception.how_came && (
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>Qayerdan eshitdi?</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Manba</label>
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{howCameLabels[reception.how_came] || reception.how_came}</p>
                  </div>
                  {reception.how_came === 'other' && reception.how_came_other && (
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Boshqa (izoh)</label>
                      <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reception.how_came_other}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sinov natijasi */}
            {reception.trialInfo && reception.trialInfo.trialResult && (
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>Sinov natijasi</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reception.trialInfo.trialResult}</p>
              </div>
            )}

            {reception.student && (
              <div className={`p-4 rounded-lg border border-gray-200 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
                  O'quvchi ma'lumotlari
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Guruh
                    </label>
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {reception.group?.name || 'Guruh yo\'q'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {reception.contactInfo && reception.contactInfo.length > 0 && (
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Aloqa tarixi
                </label>
                <div className="border border-gray-200 p-2 mt-2 space-y-2">
                  {reception.contactInfo.map((contact, index) => (
                    <div key={contact._id} className={`p-3 border border-gray-200 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {new Date(contact.contactDate).toLocaleString()}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {contact.contactNotes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reception.notes && (
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Qo'shimcha ma'lumotlar
                </label>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {reception.notes}
                </p>
              </div>
            )}

            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>Yaratilgan: {new Date(reception.created_at).toLocaleString()}</p>
              <p>Yangilangan: {new Date(reception.updated_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
            >
              Yopish
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const ReceptionPage = () => {
  const { user, token } = useAuth();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [receptions, setReceptions] = useState([]);
  const [filteredReceptions, setFilteredReceptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [openTrialDialog, setOpenTrialDialog] = useState(false);
  const [openConvertDialog, setOpenConvertDialog] = useState(false);
  const [currentReception, setCurrentReception] = useState(null);
  const [groups, setGroups] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: '',
  });

  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    parent_name: '',
    parent_phone: '',
    how_came: '',
    how_came_other: '',
    status: 'new',
    notes: ''
  });
  const [contactData, setContactData] = useState({
    contactNotes: '',
  });
  const [trialData, setTrialData] = useState({
    trialNotes: '',
    trialDate: new Date().toISOString().split('T')[0],
  });
  const [studentData, setStudentData] = useState({
    groupId: '',
    birth_date: '',
    address: '',
    gender: '',
    trial_lesson_date: ''
  });

  useEffect(() => {
    fetchReceptions();
    fetchGroups();
  }, []);

  const fetchReceptions = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/reception', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const data = response.data.data || [];
        setReceptions(data);
        setFilteredReceptions(data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Authentication required');
      } else {
        setError('Ma\'lumotlarni yuklashda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter receptions based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredReceptions(receptions);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = receptions.filter(reception => {
        return (
          (reception.first_name?.toLowerCase().includes(searchLower) || '') ||
          (reception.last_name?.toLowerCase().includes(searchLower) || '') ||
          (reception.phone?.toLowerCase().includes(searchLower) || '') ||
          (reception.parent_phone?.toLowerCase().includes(searchLower) || '')
        );
      });
      setFilteredReceptions(filtered);
    }
  }, [searchTerm, receptions]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setGroups(result.data || []);
      } else {
        console.error('Guruhlarni yuklashda xatolik:', result.message);
      }
    } catch (err) {
      console.error('Guruhlarni yuklashda xatolik:', err);
    }
  };

  const handleCreate = () => {
    setFormData({
      first_name: '',
      last_name: '',
      phone: '',
      parent_name: '',
      parent_phone: '',
      how_came: '',
      how_came_other: '',
      status: 'new',
      notes: ''
    });
    setOpenCreateDialog(true);
  };

  const handleCreateSubmit = async () => {
    // Validation
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.how_came || (formData.how_came === 'other' && !formData.how_came_other)) {
      setError('Iltimos, barcha majburiy maydonlarni to\'ldiring.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
        how_came: formData.how_came,
        how_came_other: formData.how_came === 'other' ? formData.how_came_other : undefined,
        notes: formData.notes
      };
      console.log('Sending payload:', payload); // Log the payload being sent
      const response = await axios.post('http://localhost:5000/api/reception', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('API Response:', response.data); // Log the full response
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
        setOpenCreateDialog(false);
        fetchReceptions();
      }
    } catch (error) {
      console.error('Error creating reception:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        setError('Authentication required');
      } else if (error.response?.data?.errors) {
        // Show validation errors if available
        const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
        setError(errorMessages || 'Mehmon qo\'shishda validatsiya xatoligi yuz berdi');
      } else {
        setError(error.response?.data?.message || 'Mehmon qo\'shishda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (reception) => {
    setCurrentReception(reception);
    setContactData({
      contactNotes: ''
    });
    setOpenContactDialog(true);
  };

  const handleContactSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.patch(`http://localhost:5000/api/reception/${currentReception._id}/contact`, {
        contactNotes: contactData.contactNotes
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
        setOpenContactDialog(false);
        fetchReceptions();
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Authentication required');
      } else {
        setError(error.response?.data?.message || 'Aloqa qilishda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrial = async (reception) => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/reception/${reception._id}/trial`,
        {
          trialInfo: {
            trialResult: 'muvaffaqiyatli'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
    fetchReceptions();
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Authentication required');
      } else {
        setError(error.response?.data?.message || 'Sinov ma\'lumotlarini yangilashda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = (reception) => {
    setCurrentReception(reception);
    setStudentData({
      groupId: '',
      birth_date: '',
      address: '',
      gender: '',
      trial_lesson_date: ''
    });
    setOpenConvertDialog(true);
  };

  const handleConvertSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      const now = new Date();
      const isoNow = now.toISOString();
      const today = isoNow.split('T')[0];
      const payload = {
        ...studentData,
        created_at: isoNow,
        updated_at: isoNow,
        joined_date: today,
      };
      const response = await axios.post(
        `http://localhost:5000/api/reception/${currentReception._id}/convert-to-student`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (response.data.success) {
        setOpenConvertDialog(false);
        fetchReceptions();
      }
    } catch (error) {
      setError(error.response?.data?.message || "O'quvchiga aylantirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Rostdan ham bu mehmonni o\'chirmoqchimisiz?')) return;

    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.delete(`http://localhost:5000/api/reception/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
    fetchReceptions();
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Authentication required');
      } else {
        setError(error.response?.data?.message || 'Mehmonni o\'chirishda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleView = (reception) => {
    setCurrentReception(reception);
    setOpenViewDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'o\'quvchi':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sinov':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'bekor':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex-1 w-full md:w-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className={`text-2xl font-bold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Mehmonlar
                </h1>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'
                }`}>
                  {filteredReceptions.length} ta
                </span>
              </div>
              <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500'
                } focus:outline-none focus:ring-2`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
          <button
            onClick={() => {
              setCurrentReception(null);
              setFormData({
                first_name: '',
                last_name: '',
                phone: '',
                parent_name: '',
                parent_phone: '',
                how_came: '',
                how_came_other: '',
                status: 'new',
                notes: ''
              });
              setOpenCreateDialog(true);
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Yangi mehmon
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isDarkMode ? 'bg-gray-800' : ''}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    F.I.O
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ota-ona Telefoni
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guruh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {filteredReceptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'Hech qanday natija topilmadi' : 'Ma\'lumot mavjud emas'}
                    </td>
                  </tr>
                ) : (
                filteredReceptions.map((reception) => (
                  <tr key={reception._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {reception.last_name} {reception.first_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{reception.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{reception.parent_phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {reception.group?.name || 'Guruh yo\'q'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reception.status)}`}>
                        {reception.status === 'o\'quvchi' ? 'O\'quvchi' :
                         reception.status === 'sinov' ? 'Sinov' :
                         reception.status === 'bekor' ? 'Bekor' : reception.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(reception)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {!reception.contactInfo?.contacted && (
                          <button
                            onClick={() => handleContact(reception)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PhoneIcon className="h-5 w-5" />
                          </button>
                        )}
                        {!reception.trialInfo?.trialResult && (
                          <button
                            onClick={() => handleTrial(reception)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <AcademicCapIcon className="h-5 w-5" />
                          </button>
                        )}
                        {!reception.studentId && (
                          <button
                            onClick={() => handleConvert(reception)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <UserPlusIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(reception._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ... existing dialogs ... */}
      <ContactDialog
        isOpen={openContactDialog}
        onClose={() => setOpenContactDialog(false)}
        onSubmit={handleContactSubmit}
        loading={loading}
        error={error}
        contactData={contactData}
        setContactData={setContactData}
        isDarkMode={isDarkMode}
      />
      <CreateDialog
        isOpen={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreateSubmit}
        loading={loading}
        error={error}
        formData={formData}
        setFormData={setFormData}
        isDarkMode={isDarkMode}
      />
      <ConvertDialog
        isOpen={openConvertDialog}
        onClose={() => setOpenConvertDialog(false)}
        onSubmit={handleConvertSubmit}
        loading={loading}
        error={error}
        studentData={studentData}
        setStudentData={setStudentData}
        groups={groups}
        isDarkMode={isDarkMode}
      />
      <ViewDialog
        isOpen={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        reception={currentReception}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ReceptionPage; 