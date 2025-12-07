import Select from 'react-select';
import {
  BanknotesIcon,
  CreditCardIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
  
export default function PaymentForm({
  isDarkMode,
  students,
  studentGroups,
  selectedStudent,
  selectedGroup,
  groupCourse,
  formData,
  setFormData,
  onStudentChange,
  onGroupChange,
  customSelectStyles
}) {
  return (
    <div className="mt-4 space-y-4">
      {/* Student Selection */}
      <div>
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Student *
        </label>
        <Select
          value={selectedStudent}
          onChange={onStudentChange}
          options={students}
          styles={{
            ...customSelectStyles,
            menuPortal: base => ({
              ...base,
              zIndex: 9999
            })
          }}
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          placeholder="Select student"
          isClearable
          isSearchable
          noOptionsMessage={() => "No students found"}
        />
      </div>

      {/* Group Selection */}
      <div>
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Group *
        </label>
        <Select
          value={selectedGroup}
          onChange={onGroupChange}
          options={Array.isArray(studentGroups) ? studentGroups.map(group => ({
            value: group.id || group._id,
            label: group.label || `${group.name || 'Unnamed Group'} - ${group.course?.name || 'No course'}`,
            ...group
          })) : []}
          styles={{
            ...customSelectStyles,
            menuPortal: base => ({
              ...base,
              zIndex: 9999
            })
          }}
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          placeholder={studentGroups?.length > 0 ? "Select group" : selectedStudent ? "No groups available" : "Select a student first"}
          isClearable
          isSearchable
          isDisabled={!selectedStudent || !studentGroups?.length}
          noOptionsMessage={() => "No groups found"}
        />
      </div>
  
        {/* Course Name */}
        {selectedGroup && groupCourse && (
          <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Course:</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {groupCourse.name}
            </p>
          </div>
        )}

        {/* Payment Details */}
        {selectedGroup && groupCourse && (
          <>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Payment Amount
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <BanknotesIcon className="h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="cash"
                      value={formData.amounts.cash}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        amounts: { ...prev.amounts, cash: Number(e.target.value) }
                      }))}
                      className={`mt-1 block w-full rounded-lg border px-4 py-2 text-right transition focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Cash (UZS)"
                      min={0}
                      autoComplete="off"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="card"
                      value={formData.amounts.card}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        amounts: { ...prev.amounts, card: Number(e.target.value) }
                      }))}
                      className={`mt-1 block w-full rounded-lg border px-4 py-2 text-right transition focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Card (UZS)"
                      min={0}
                      autoComplete="off"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowPathIcon className="h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="transfer"
                      value={formData.amounts.transfer}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        amounts: { ...prev.amounts, transfer: Number(e.target.value) }
                      }))}
                      className={`mt-1 block w-full rounded-lg border px-4 py-2 text-right transition focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Transfer (UZS)"
                      min={0}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={e => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                    className={`mt-1 block w-full rounded-lg border px-4 py-2 transition focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    required
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className={`mt-1 block w-full rounded-lg border px-4 py-2 transition focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
  
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className={`mt-1 block w-full rounded-lg border px-4 py-2 transition focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Additional information"
                  autoComplete="off"
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }