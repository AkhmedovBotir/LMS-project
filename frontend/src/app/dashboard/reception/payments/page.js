'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useTheme } from '@/app/context/ThemeContext';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import Select from 'react-select';

// Components
import PaymentCreateDialog from './PaymentCreateDialog';
import PaymentViewDialog from './PaymentViewDialog';
import PaymentFilterDialog from './PaymentFilterDialog';
import PaymentTable from './PaymentTable';

// Icons
import {
  BanknotesIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function PaymentsManagement() {
  const { user, token } = useAuth();
  const { isDarkMode } = useTheme();
  
  // States
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    total_pages: 0,
    limit: 10
  });

  // Filters
  const [filters, setFilters] = useState({
    student_id: '',
    group_id: '',
    payment_type: '',
    payment_period: '',
    status: '',
    start_date: '',
    end_date: ''
  });

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Check auth
  const checkAuth = () => {
    const token = Cookies.get('token');
    if (!token) {
      window.location.href = '/login';
      return false;
    }
    return token;
  };

  // API requests
  const fetchWithAuth = async (url, options = {}) => {
    const token = checkAuth();
    if (!token) return null;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });

      if (response.status === 401) {
        Cookies.remove('token');
        window.location.href = '/login';
        return null;
      }

      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.student_id && { student_id: filters.student_id }),
        ...(filters.group_id && { group_id: filters.group_id }),
        ...(filters.payment_type && { payment_type: filters.payment_type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      });

      const response = await fetchWithAuth(`http://localhost:5000/api/payments?${queryParams}`);
      if (!response) return;

      const result = await response.json();
      if (result.success) {
        setPayments(result.data || []);
        setPagination(result.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          total_pages: 1
        });
      } else {
        setError(result.message || 'Failed to load payments');
        setPayments([]);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setError('Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      let allStudents = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await fetchWithAuth(`http://localhost:5000/api/students?page=${page}&limit=100`);
        if (!response) return;
        
        const result = await response.json();
        if (result.success) {
          allStudents = allStudents.concat(result.data || []);
          totalPages = result.pagination?.total_pages || 1;
          page++;
        } else {
          setError(result.message || 'Failed to load students');
          setStudents([]);
          return;
        }
      } while (page <= totalPages);
      
      const mappedStudents = allStudents.map(student => ({
        value: student._id,
        label: `${student.last_name} ${student.first_name} - ${student.phone || ''}`
      }));
      setStudents(mappedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      setError('Failed to load students');
      setStudents([]);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:5000/api/courses');
      if (!response) return;

      const result = await response.json();
      if (result.success) {
        setCourses(result.data || []);
      } else {
        setError(result.message || 'Failed to load courses');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Failed to load courses');
      setCourses([]);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPayments();
    setOpenFilterDialog(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      student_id: '',
      group_id: '',
      payment_type: '',
      status: '',
      start_date: '',
      end_date: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPayments();
  };

  // Handle view payment
  const handleOpenViewDialog = async (payment) => {
    try {
      const response = await fetchWithAuth(`http://localhost:5000/api/payments/${payment._id}`);
      if (!response) return;

      const result = await response.json();
      if (result.success) {
        setSelectedPayment(result.data);
        setOpenViewDialog(true);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error loading payment details:', error);
      setSnackbar({ open: true, message: 'Error loading payment details', severity: 'error' });
    }
  };

  // Close all dialogs
  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    setOpenViewDialog(false);
    setOpenFilterDialog(false);
    setSelectedPayment(null);
  };

  // Initial data fetch
  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchPayments(),
            fetchStudents(),
            fetchCourses()
          ]);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [token, pagination.page, filters]);

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
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-gray-900'}`}>
          Payments
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setOpenFilterDialog(true)}
            className={`flex items-center px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-900'
            }`}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filter
          </button>
          <button
            onClick={() => setOpenCreateDialog(true)}
            className={`flex items-center px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            <BanknotesIcon className="w-5 h-5 mr-2" />
            New Payment
          </button>
        </div>
      </div>

      {/* Table */}
      <PaymentTable 
        payments={payments} 
        isDarkMode={isDarkMode} 
        onViewPayment={handleOpenViewDialog}
      />

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
          Total: {pagination.total} payments
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`px-3 py-1 rounded-lg ${
              pagination.page === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-900'
            }`}
          >
            Previous
          </button>
          <span className={`px-3 py-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {pagination.page} / {pagination.total_pages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.total_pages}
            className={`px-3 py-1 rounded-lg ${
              pagination.page === pagination.total_pages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-900'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <PaymentCreateDialog
        open={openCreateDialog}
        onClose={handleCloseDialog}
        isDarkMode={isDarkMode}
        students={students}
        courses={courses}
        fetchPayments={fetchPayments}
        setSnackbar={setSnackbar}
      />

      <PaymentViewDialog
        open={openViewDialog}
        onClose={handleCloseDialog}
        isDarkMode={isDarkMode}
        payment={selectedPayment}
      />

      <PaymentFilterDialog
        open={openFilterDialog}
        onClose={handleCloseDialog}
        isDarkMode={isDarkMode}
        filters={filters}
        setFilters={setFilters}
        students={students}
        courses={courses}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg ${
          snackbar.severity === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {snackbar.message}
        </div>
      )}
    </div>
  );
}