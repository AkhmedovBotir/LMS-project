'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import { format, parseISO } from 'date-fns';
import { uz } from 'date-fns/locale';
import { theme } from '@/theme';

export default function ContactManagement() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('issues');
  const [students, setStudents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentContact, setCurrentContact] = useState(null);
  const [formData, setFormData] = useState({
    issue_type: '',
    description: '',
    status: '',
    contact_method: '',
    contact_result: ''
  });

  // Alert xabarini vaqtinchalik ko'rsatish
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchGroups = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('http://localhost:5000/api/groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setGroups(response.data.data);
      }
    } catch (error) {
      console.error('Guruhlarni yuklashda xatolik:', error);
    }
  };

  const fetchStudentsWithIssues = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const url = new URL('http://localhost:5000/api/contact/students-with-issues');
      
      if (selectedGroup) url.searchParams.append('group_id', selectedGroup);

      const response = await axios.get(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  const fetchContactHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const url = new URL('http://localhost:5000/api/contact/history');
      
      if (selectedGroup) url.searchParams.append('group_id', selectedGroup);
      if (selectedStatus) url.searchParams.append('status', selectedStatus);

      const response = await axios.get(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setContacts(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, selectedStatus]);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (activeTab === 'issues') {
      fetchStudentsWithIssues();
    } else {
      fetchContactHistory();
    }
  }, [activeTab, fetchStudentsWithIssues, fetchContactHistory]);

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleContact = (student) => {
    setCurrentStudent(student);
    setFormData({
      issue_type: '',
      description: '',
      status: '',
      contact_method: '',
      contact_result: ''
    });
    setShowContactModal(true);
  };

  const handleUpdateStatus = (contact) => {
    setCurrentContact(contact);
    setFormData({
      status: '',
      contact_method: '',
      contact_result: ''
    });
    setShowStatusModal(true);
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      await axios.post(
        'http://localhost:5000/api/contact',
        {
          student_id: currentStudent.student_id,
          group_id: currentStudent.group_id,
          issue_type: formData.issue_type,
          description: formData.description
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess('Aloqa yozuvi muvaffaqiyatli yaratildi');
      setShowContactModal(false);
      fetchStudentsWithIssues();
      fetchContactHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleSubmitStatus = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      await axios.put(
        `http://localhost:5000/api/contact/${currentContact._id}/status`,
        {
          status: formData.status,
          contact_method: formData.contact_method,
          contact_result: formData.contact_result
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess('Status muvaffaqiyatli yangilandi');
      setShowStatusModal(false);
      fetchStudentsWithIssues();
      fetchContactHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'contacted':
        return 'text-blue-500';
      case 'resolved':
        return 'text-green-500';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Kutilmoqda';
      case 'contacted':
        return 'Aloqa qilingan';
      case 'resolved':
        return 'Hal qilingan';
      default:
        return status;
    }
  };

  const getContactMethodText = (method) => {
    switch (method) {
      case 'phone':
        return 'Telefon';
      case 'message':
        return 'Xabar';
      case 'visit':
        return 'Tashrif';
      default:
        return method;
    }
  };

  const getIssueTypeText = (student) => {
    const issues = [];
    if (student.issues.low_grade) {
      issues.push(`Past baho (${student.issues.low_grade.average_grade})`);
    }
    if (student.issues.attendance) {
      issues.push(`Dars qoldirish (${student.issues.attendance.absences} marta)`);
    }
    return issues.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: isDarkMode ? theme.colors.background.dark : theme.colors.background.light }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: theme.colors.primary.light }}></div>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ 
      backgroundColor: isDarkMode ? theme.colors.background.dark : theme.colors.background.light,
      color: isDarkMode ? theme.colors.text.dark : theme.colors.text.light
    }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Aloqa boshqaruvi</h1>

        {/* Alert xabarlari */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 animate-fade-in">
            {success}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'issues'
                ? 'bg-yellow-500 text-black'
                : isDarkMode
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-900'
            }`}
          >
            Muammoli o'quvchilar
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'history'
                ? 'bg-yellow-500 text-black'
                : isDarkMode
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-900'
            }`}
          >
            Aloqa tarixi
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <select
            value={selectedGroup}
            onChange={handleGroupChange}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 text-white border-gray-700' 
                : 'bg-white text-gray-900 border-gray-300'
            } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
          >
            <option value="">Barcha guruhlar</option>
            {groups.map(group => (
              <option key={group._id} value={group._id}>{group.name}</option>
            ))}
          </select>

          {activeTab === 'history' && (
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            >
              <option value="">Barcha statuslar</option>
              <option value="pending">Kutilmoqda</option>
              <option value="contacted">Aloqa qilingan</option>
              <option value="resolved">Hal qilingan</option>
            </select>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {activeTab === 'issues' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">F.I.O</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Telefon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Muammo turi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amallar</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {students.map(student => (
                  <tr key={student.student_id} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {student.first_name} {student.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {getIssueTypeText(student)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleContact(student)}
                        className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
                      >
                        Aloqa qilish
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      Muammoli o'quvchilar topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">O'quvchi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Guruh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Muammo turi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tavsif</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Yaratilgan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amallar</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {contacts.map(contact => (
                  <tr key={contact._id} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {contact.student_id.first_name} {contact.student_id.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {contact.group_id.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                        {getStatusText(contact.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {contact.issue_type === 'attendance' ? 'Dars qoldirish' : 'Past baho'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm max-w-xs truncate">
                        {contact.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(parseISO(contact.created_at), 'dd MMM yyyy', { locale: uz })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {contact.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(contact)}
                          className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
                        >
                          Statusni yangilash
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Aloqa yozuvlari topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`p-6 rounded-xl shadow-lg w-full max-w-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className="text-xl font-bold mb-4">Aloqa yozuvi yaratish</h2>
            <form onSubmit={handleSubmitContact}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Muammo turi</label>
                <select
                  value={formData.issue_type}
                  onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-900 border-gray-300'
                  } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  required
                >
                  <option value="">Tanlang</option>
                  <option value="attendance">Dars qoldirish</option>
                  <option value="low_grade">Past baho</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-900 border-gray-300'
                  } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  rows="4"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`p-6 rounded-xl shadow-lg w-full max-w-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className="text-xl font-bold mb-4">Statusni yangilash</h2>
            <form onSubmit={handleSubmitStatus}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-900 border-gray-300'
                  } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  required
                >
                  <option value="">Tanlang</option>
                  <option value="contacted">Aloqa qilingan</option>
                  <option value="resolved">Hal qilingan</option>
                </select>
              </div>

              {(formData.status === 'contacted' || formData.status === 'resolved') && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Aloqa usuli</label>
                    <select
                      value={formData.contact_method}
                      onChange={(e) => setFormData({ ...formData, contact_method: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      required
                    >
                      <option value="">Tanlang</option>
                      <option value="phone">Telefon</option>
                      <option value="message">Xabar</option>
                      <option value="visit">Tashrif</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Natija</label>
                    <textarea
                      value={formData.contact_result}
                      onChange={(e) => setFormData({ ...formData, contact_result: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      rows="4"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
                >
                  Yangilash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
