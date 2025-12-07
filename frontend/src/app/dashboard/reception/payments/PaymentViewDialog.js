'use client';

import { 
  XMarkIcon, 
  UserIcon, 
  BookOpenIcon, 
  CurrencyDollarIcon, 
  CalendarIcon, 
  ClockIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export default function PaymentViewDialog({ open, onClose, isDarkMode, payment }) {
  if (!open || !payment) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' UZS';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: '✕' },
      refunded: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '↩' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: '?' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'cash':
        return <BanknotesIcon className="h-5 w-5 text-amber-500" />;
      case 'card':
        return <CreditCardIcon className="h-5 w-5 text-blue-500" />;
      case 'transfer':
        return <ArrowPathIcon className="h-5 w-5 text-green-500" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const totalAmount = (payment.amounts?.cash || 0) + 
                    (payment.amounts?.card || 0) + 
                    (payment.amounts?.transfer || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className={`relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
        }`}>
          {/* Header */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Payment Details
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">ID: {payment._id}</span>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Student and Course Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  STUDENT
                </h3>
                <div className="mt-1">
                  <p className="font-medium">
                    {payment.student_id?.first_name} {payment.student_id?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">ID: {payment.student_id?._id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <BookOpenIcon className="h-4 w-4" />
                  COURSE & GROUP
                </h3>
                <div className="mt-1">
                  <p className="font-medium">{payment.course_id?.name}</p>
                  <p className="text-sm text-gray-500">Group ID: {payment.group_id}</p>
                </div>
              </div>
            </div>

            {/* Payment Amounts */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">PAYMENT AMOUNTS</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Cash</span>
                  <span className="font-mono">{formatCurrency(payment.amounts?.cash || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Card</span>
                  <span className="font-mono">{formatCurrency(payment.amounts?.card || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Transfer</span>
                  <span className="font-mono">{formatCurrency(payment.amounts?.transfer || 0)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Period */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Payment Date</p>
                <p className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4 text-blue-500" />
                  {formatDate(payment.payment_date)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Period</p>
                <p className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4 text-purple-500" />
                  {payment.payment_period?.months_count} month{payment.payment_period?.months_count !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Payment Type</p>
                <p className="flex items-center gap-1">
                  {getPaymentTypeIcon(payment.payment_type)}
                  <span className="capitalize">{payment.payment_type}</span>
                </p>
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">PAYMENT PERIOD</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Start Date</p>
                  <p className="mt-1">{formatDate(payment.payment_period?.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="mt-1">{formatDate(payment.payment_period?.end_date)}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-500">Created</p>
                <p className="text-gray-600 dark:text-gray-300">
                  {new Date(payment.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Last Updated</p>
                <p className="text-gray-600 dark:text-gray-300">
                  {new Date(payment.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Notes */}
            {payment.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">NOTES</h3>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                  {payment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
