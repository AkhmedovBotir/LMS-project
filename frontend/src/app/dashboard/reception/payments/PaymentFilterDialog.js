'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

export default function PaymentFilterDialog({ 
  open, 
  onClose, 
  isDarkMode, 
  filters, 
  setFilters, 
  students, 
  courses, 
  onApply, 
  onReset 
}) {
  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentChange = (selectedOption) => {
    setFilters(prev => ({
      ...prev,
      student_id: selectedOption ? selectedOption.value : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  // Get selected student
  const selectedStudent = students.find(s => s.value === filters.student_id) || null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div 
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className={`text-lg leading-6 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Filter Payments
                  </h3>
                  <button
                    onClick={onClose}
                    className={`p-1 rounded-full ${
                      isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Student Filter */}
                    <div>
                      <label htmlFor="student_id" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Student
                      </label>
                      <select
                        id="student_id"
                        name="student_id"
                        value={filters.student_id}
                        onChange={handleChange}
                        className={`block w-full rounded-md shadow-sm ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'border-gray-300 text-gray-900'
                        } sm:text-sm`}
                      >
                        <option value="">All Students</option>
                        {students.map((student) => (
                          <option key={student.value} value={student.value}>
                            {student.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label htmlFor="status" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={filters.status}
                        onChange={handleChange}
                        className={`block w-full rounded-md shadow-sm ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'border-gray-300 text-gray-900'
                        } sm:text-sm`}
                      >
                        <option value="">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label htmlFor="start_date" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        From Date
                      </label>
                      <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={filters.start_date}
                        onChange={handleChange}
                        className={`block w-full rounded-md shadow-sm ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'border-gray-300 text-gray-900'
                        } sm:text-sm`}
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label htmlFor="end_date" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        To Date
                      </label>
                      <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={filters.end_date}
                        onChange={handleChange}
                        className={`block w-full rounded-md shadow-sm ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'border-gray-300 text-gray-900'
                        } sm:text-sm`}
                      />
                    </div>
                  </div>

                  {/* Payment Type */}
                  <div>
                    <label htmlFor="payment_type" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Payment Type
                    </label>
                    <select
                      id="payment_type"
                      name="payment_type"
                      value={filters.payment_type}
                      onChange={handleChange}
                      className={`block w-full rounded-md shadow-sm ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'border-gray-300 text-gray-900'
                      } sm:text-sm`}
                    >
                      <option value="">All Types</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="transfer">Bank Transfer</option>
                    </select>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <button
              type="button"
              onClick={handleSubmit}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={`mt-3 w-full inline-flex justify-center rounded-md border ${
                isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
              } shadow-sm px-4 py-2 bg-transparent text-base font-medium hover:bg-opacity-10 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`mt-3 w-full inline-flex justify-center rounded-md border ${
                isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
              } shadow-sm px-4 py-2 bg-transparent text-base font-medium hover:bg-opacity-10 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
