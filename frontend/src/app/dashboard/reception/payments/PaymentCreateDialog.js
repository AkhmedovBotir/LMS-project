import { useState, useEffect } from 'react';
import Select from 'react-select';
import Cookies from 'js-cookie';
import {
  BanknotesIcon,
  CreditCardIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import PaymentForm from './PaymentForm';

export default function PaymentCreateDialog({
  open,
  onClose,
  isDarkMode,
  students,
  courses,
  fetchPayments,
  setSnackbar
}) {
  const [formData, setFormData] = useState({
    student_id: '',
    group_id: '',
    amounts: { cash: 0, card: 0, transfer: 0 },
    payment_date: new Date().toISOString().split('T')[0],
    months_count: 1,
    start_date: '',
    period_type: 'monthly',
    notes: ''
  });

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentGroups, setStudentGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupCourse, setGroupCourse] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(null);
  const [showPayRemaining, setShowPayRemaining] = useState(false);
  const [payRemainingValue, setPayRemainingValue] = useState('');
  const [paying, setPaying] = useState(false);

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
    placeholder: (provided) => ({
      ...provided,
      color: isDarkMode ? '#9ca3af' : '#6b7280',
    }),
    input: (provided) => ({
      ...provided,
      color: isDarkMode ? '#fff' : '#1f2937',
    }),
  };

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      setFormData({
        student_id: '',
        group_id: '',
        amounts: { cash: 0, card: 0, transfer: 0 },
        payment_date: new Date().toISOString().split('T')[0],
        months_count: 1,
        start_date: '',
        period_type: 'monthly',
        notes: ''
      });
      setSelectedStudent(null);
      setSelectedGroup(null);
      setStudentGroups([]);
      setGroupCourse(null);
    }
  }, [open]);

  const handleStudentChange = async (option) => {
    setSelectedStudent(option);
    setFormData(prev => ({ ...prev, student_id: option?.value || '' }));
    
    if (option?.value) {
      try {
        const response = await fetch(`http://localhost:5000/api/students/${option.value}`, {
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          const studentData = result.data;
          const groups = studentData.groups || [];
          
          // Check if student has any payments
          if (studentData.payments && studentData.payments.length > 0) {
            // Sort payments by payment_date in descending order
            const sortedPayments = [...studentData.payments].sort((a, b) => 
              new Date(b.payment_date) - new Date(a.payment_date)
            );
            
            // Get the most recent payment
            const lastPayment = sortedPayments[0];
            if (lastPayment.payment_period?.end_date) {
              // Set start date to the day after the last payment's end date
              const endDate = new Date(lastPayment.payment_period.end_date);
              endDate.setDate(endDate.getDate() + 1);
              const nextDay = endDate.toISOString().split('T')[0];
              
              setFormData(prev => ({
                ...prev,
                start_date: nextDay,
                // Also set the course_id and group_id from the last payment
                course_id: lastPayment.course_id?._id || '',
                group_id: lastPayment.group_id || ''
              }));
              
              // If the group is in the student's groups, select it
              const lastGroup = groups.find(g => g.id === lastPayment.group_id);
              if (lastGroup) {
                setSelectedGroup({
                  value: lastGroup.id,
                  label: lastGroup.name
                });
                setGroupCourse({
                  id: lastGroup.course.id,
                  name: lastGroup.course.name
                });
              }
              
              return; // Exit early since we've set the start date
            }
          }
          setStudentGroups(groups);
          
          if (groups.length === 1) {
            const group = groups[0];
            const groupOption = {
              value: group.id,
              label: `${group.name} - ${group.course?.name || 'No course name'}`
            };
            handleGroupChange(groupOption);
          }
        }
      } catch (error) {
        console.error('Error fetching student groups:', error);
        setStudentGroups([]);
      }
    } else {
      setStudentGroups([]);
      setSelectedGroup(null);
      setGroupCourse(null);
    }
    
    setFormData(prev => ({
      ...prev,
      group_id: '',
      amounts: { cash: 0, card: 0, transfer: 0 }
    }));
  };

  const handleGroupChange = async (option) => {
    setSelectedGroup(option);
    setFormData(prev => ({ ...prev, group_id: option?.value || '' }));

    if (option?.value) {
      try {
        const response = await fetch(`http://localhost:5000/api/groups/${option.value}`, {
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          const groupData = result.data;
          
          // Set the course information
          if (groupData.course_id) {
            const course = {
              id: groupData.course_id._id || groupData.course_id,
              name: groupData.course_id.name || 'No course name'
            };
            setGroupCourse(course);
            
            setFormData(prev => ({
              ...prev,
              course_id: course.id
            }));
          }
          
          // If no start date is set yet, use the group's start date
          if (groupData.start_date && !formData.start_date) {
            setFormData(prev => ({
              ...prev,
              start_date: new Date(groupData.start_date).toISOString().split('T')[0]
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching group details:', error);
        setGroupCourse(null);
      }
    } else {
      setGroupCourse(null);
    }

    setFormData(prev => ({
      ...prev,
      amounts: { cash: 0, card: 0, transfer: 0 }
    }));
  };

  const handleCreatePayment = async () => {
    if (!formData.student_id || !formData.course_id || !formData.payment_date || !formData.start_date) {
      setSnackbar({ open: true, message: "Student, course, payment date and start date are required", severity: 'error' });
      return;
    }
    
    const totalAmount = Number(formData.amounts.cash || 0) + 
                        Number(formData.amounts.card || 0) + 
                        Number(formData.amounts.transfer || 0);
                        
    if (totalAmount <= 0) {
      setSnackbar({ open: true, message: "To'lov miqdori 0 dan katta bo'lishi kerak", severity: 'error' });
      return;
    }
    
    // Validate payment date is not in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paymentDate = new Date(formData.payment_date);
    
    if (paymentDate > today) {
      setSnackbar({ 
        open: true, 
        message: "To'lov sanasi bugungi sanadan keyingi sana bo'lishi mumkin emas", 
        severity: 'error' 
      });
      return;
    }

    try {
      setPaying(true);
      const token = Cookies.get('token');
      
      // Format the payment date to include timezone
      const paymentDate = new Date(formData.payment_date);
      paymentDate.setHours(0, 0, 0, 0); // Set to start of day in local time
      
      const payload = {
        student_id: formData.student_id,
        course_id: formData.course_id,
        group_id: formData.group_id || null,
        amounts: {
          cash: Number(formData.amounts.cash) || 0,
          card: Number(formData.amounts.card) || 0,
          transfer: Number(formData.amounts.transfer) || 0
        },
        payment_date: paymentDate.toISOString(), // Format as ISO string with timezone
        months_count: formData.months_count || 1,
        start_date: formData.start_date,
        period_type: formData.period_type || 'monthly',
        notes: formData.notes || ''
      };

      console.log('Sending payment:', JSON.stringify(payload, null, 2));

      console.log('Sending payment request with payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch('http://localhost:5000/api/payments/', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('API Response:', responseData);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error("Serverdan noto'g'ri javob qaytardi. Iltimos, qaytadan urinib ko'ring.");
      }
      
      if (!response.ok) {
        const serverMessage = responseData?.message || responseData?.error || response.statusText;
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          serverMessage,
          response: responseData
        });
        
        let errorMessage = "To'lov qo'shishda xatolik yuz berdi";
        
        if (response.status === 400) {
          errorMessage = serverMessage || "Noto'g'ri so'rov. Ma'lumotlarni tekshiring.";
        } else if (response.status === 401) {
          errorMessage = "Kirish amalga oshmadi. Iltimos, qaytadan kiring.";
        } else if (response.status === 500) {
          errorMessage = "Serverda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.";
        }
        
        throw new Error(errorMessage);
      }
      
      if (!responseData.success) {
        throw new Error(responseData.message || "To'lov qo'shishda xatolik yuz berdi");
      }
      
      setSnackbar({ 
        open: true, 
        message: responseData.message || "To'lov muvaffaqiyatli qo'shildi", 
        severity: 'success' 
      });
      
      fetchPayments();
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || "To'lov qo'shishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.", 
        severity: 'error',
        autoHideDuration: 10000
      });
    } finally {
      setPaying(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`inline-block align-bottom ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className={`text-lg leading-6 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create Payment
                </h3>
                
                <PaymentForm 
                  isDarkMode={isDarkMode}
                  students={students}
                  studentGroups={studentGroups}
                  selectedStudent={selectedStudent}
                  selectedGroup={selectedGroup}
                  groupCourse={groupCourse}
                  formData={formData}
                  setFormData={setFormData}
                  onStudentChange={handleStudentChange}
                  onGroupChange={handleGroupChange}
                  customSelectStyles={customSelectStyles}
                />
              </div>
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
            <button
              type="button"
              onClick={handleCreatePayment}
              disabled={!formData.student_id || !formData.group_id || !groupCourse}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
              } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm ${
                (!formData.student_id || !formData.group_id || !groupCourse) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`mt-3 w-full inline-flex justify-center rounded-md border ${
                isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
              } shadow-sm px-4 py-2 ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'
              } text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}