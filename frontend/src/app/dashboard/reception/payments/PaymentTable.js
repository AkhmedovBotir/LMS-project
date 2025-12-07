'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { BanknotesIcon, CreditCardIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function PaymentTable({ payments, isDarkMode, onViewPayment }) {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatPeriod = (startDate, endDate) => {
    try {
      return `${format(new Date(startDate), 'MMM dd')} - ${format(new Date(endDate), 'MMM dd, yyyy')}`;
    } catch (error) {
      return 'Invalid period';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' UZS';
  };

  const getTotalAmount = (amounts) => {
    return (amounts?.cash || 0) + (amounts?.card || 0) + (amounts?.transfer || 0);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: '✕' },
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: '?' };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'cash':
        return <BanknotesIcon className="h-4 w-4 text-amber-500" />;
      case 'card':
        return <CreditCardIcon className="h-4 w-4 text-blue-500" />;
      case 'transfer':
        return <ArrowPathIcon className="h-4 w-4 text-green-500" />;
      default:
        return <BanknotesIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  if (payments.length === 0) {
    return (
      <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="mx-auto w-12 h-12 mb-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-medium">No payments found</p>
        <p className="text-sm mt-1">Create a new payment to get started</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className="text-gray-900">Student & Course</span>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className="text-gray-900">Payment Period</span>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-right">
                <span className="text-gray-900">Amount</span>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className="text-gray-900">Type</span>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className="text-gray-900">Status</span>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className="text-gray-900">Date</span>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-900' : 'divide-gray-200 bg-white'}`}>
            {payments.map((payment) => (
              <tr 
                key={payment._id} 
                className={`transition-colors ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} cursor-pointer`}
                onClick={() => onViewPayment(payment)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-medium">
                      {payment.student_id?.first_name?.[0] || '?'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-900">
                        {payment.student_id?.first_name} {payment.student_id?.last_name}
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-900 mt-1">
                        {payment.course_id?.name || 'No course'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {payment.payment_period ? (
                      formatPeriod(payment.payment_period.start_date, payment.payment_period.end_date)
                    ) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-900 dark:text-gray-900 mt-1">
                    {payment.payment_period?.months_count} month{payment.payment_period?.months_count !== 1 ? 's' : ''}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-900">
                    {formatCurrency(getTotalAmount(payment.amounts))}
                  </div>
                  <div className="text-xs text-gray-900 dark:text-gray-900 flex items-center justify-end gap-1 mt-1">
                    {payment.amounts?.cash > 0 && (
                      <span className="inline-flex items-center">
                        <BanknotesIcon className="h-3 w-3 mr-0.5 text-amber-500" />
                        {formatCurrency(payment.amounts.cash)}
                      </span>
                    )}
                    {payment.amounts?.card > 0 && (
                      <span className="inline-flex items-center">
                        <CreditCardIcon className="h-3 w-3 mr-0.5 text-blue-500" />
                        {formatCurrency(payment.amounts.card)}
                      </span>
                    )}
                    {payment.amounts?.transfer > 0 && (
                      <span className="inline-flex items-center">
                        <ArrowPathIcon className="h-3 w-3 mr-0.5 text-green-500" />
                        {formatCurrency(payment.amounts.transfer)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getPaymentTypeIcon(payment.payment_type)}
                    <span className="capitalize">{payment.payment_type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(payment.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-900">
                    {formatDate(payment.payment_date || payment.createdAt)}
                  </div>
                  <div className="text-xs text-gray-900 dark:text-gray-900">
                    {formatDistanceToNow(new Date(payment.payment_date || payment.createdAt), { addSuffix: true })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewPayment(payment);
                    }}
                    className="text-gray-900 hover:text-gray-700"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
