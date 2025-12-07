'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, PolarArea } from 'react-chartjs-2';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { uz } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

export default function PaymentStatistics() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({
    period: {
      start: '',
      end: ''
    },
    summary: {
      total_payments: 0,
      total_amount: 0,
      average_payment: 0
    },
    by_payment_type: {},
    by_status: {},
    by_course: {},
    daily_trends: {}
  });

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const url = new URL('http://localhost:5000/api/statistics-department/payments');
      
      if (period === 'custom') {
        if (startDate && endDate) {
          url.searchParams.append('startDate', startDate);
          url.searchParams.append('endDate', endDate);
        }
      } else {
        url.searchParams.append('period', period);
        if (startDate) {
          url.searchParams.append('customDate', startDate);
        }
      }

      const response = await axios.get(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return;
    
    if (name === 'startDate') {
      setStartDate(value);
      if (period === 'yearly') {
        const year = value.split('-')[0];
        setStartDate(`${year}-01-01`);
        setEndDate(`${year}-12-31`);
      }
    } else if (name === 'endDate') {
      setEndDate(value);
      if (period === 'yearly') {
        const year = value.split('-')[0];
        setStartDate(`${year}-01-01`);
        setEndDate(`${year}-12-31`);
      }
    }
  };

  const handleYearChange = (e) => {
    const value = e.target.value;
    if (value.length === 4) {
      setStartDate(`${value}-01-01`);
      setEndDate(`${value}-12-31`);
    }
  };

  const handleYearBlur = (e) => {
    const value = e.target.value;
    if (value.length === 4) {
      setStartDate(`${value}-01-01`);
      setEndDate(`${value}-12-31`);
    }
  };

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setPeriod(newPeriod);
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    switch (newPeriod) {
      case 'daily':
        setStartDate(`${year}-${month}-${day}`);
        setEndDate(`${year}-${month}-${day}`);
        break;
      case 'weekly':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        setStartDate(startOfWeek.toISOString().split('T')[0]);
        setEndDate(endOfWeek.toISOString().split('T')[0]);
        break;
      case 'monthly':
        setStartDate(`${year}-${month}-01`);
        setEndDate(`${year}-${month}-${new Date(year, month, 0).getDate()}`);
        break;
      case 'yearly':
        setStartDate(`${year}-01-01`);
        setEndDate(`${year}-12-31`);
        break;
      case 'custom':
        setStartDate(`${year}-${month}-01`);
        setEndDate(`${year}-${month}-${day}`);
        break;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMainChartData = () => {
    switch (period) {
      case 'daily':
        const dailyDates = Object.keys(stats.daily_trends || {}).sort();
        return {
          labels: dailyDates.map(date => format(parseISO(date), 'dd MMMM', { locale: uz })),
          datasets: [
            {
              label: 'To\'lov miqdori',
              data: dailyDates.map(date => stats.daily_trends[date].amount || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'To\'lovlar soni',
              data: dailyDates.map(date => stats.daily_trends[date].count || 0),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              yAxisID: 'y1',
            }
          ],
        };
      case 'weekly':
        const days = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - date.getDay() + i);
          return date.toISOString().split('T')[0];
        });
        
        return {
          labels: days,
          datasets: [
            {
              label: 'To\'lov miqdori',
              data: weekDates.map(date => stats.daily_trends[date]?.amount || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'To\'lovlar soni',
              data: weekDates.map(date => stats.daily_trends[date]?.count || 0),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              yAxisID: 'y1',
            }
          ],
        };
      case 'monthly':
        const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
        const currentYear = new Date().getFullYear();
        
        // Oylik ma'lumotlarni yig'ish
        const monthlyData = monthNames.map((_, index) => {
          const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
          const monthData = Object.values(stats.by_course || {})
            .filter(course => course.month === monthKey)
            .reduce((acc, course) => ({
              amount: acc.amount + (course.total_amount || 0),
              count: acc.count + (course.payment_count || 0)
            }), { amount: 0, count: 0 });
          return monthData;
        });

        return {
          labels: monthNames,
          datasets: [
            {
              label: 'To\'lov miqdori',
              data: monthlyData.map(data => data.amount),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'To\'lovlar soni',
              data: monthlyData.map(data => data.count),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              yAxisID: 'y1',
            }
          ],
        };
      case 'yearly':
        const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 4 + i).toString());
        
        // Yillik ma'lumotlarni yig'ish
        const yearlyData = years.map(year => {
          const yearData = Object.values(stats.by_course || {})
            .filter(course => course.year === year)
            .reduce((acc, course) => ({
              amount: acc.amount + (course.total_amount || 0),
              count: acc.count + (course.payment_count || 0)
            }), { amount: 0, count: 0 });
          return yearData;
        });

        return {
          labels: years,
          datasets: [
            {
              label: 'To\'lov miqdori',
              data: yearlyData.map(data => data.amount),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'To\'lovlar soni',
              data: yearlyData.map(data => data.count),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              yAxisID: 'y1',
            }
          ],
        };
      case 'custom':
        const customDates = Object.keys(stats.daily_trends || {}).sort();
        return {
          labels: customDates.map(date => format(parseISO(date), 'dd MMMM', { locale: uz })),
          datasets: [
            {
              label: 'To\'lov miqdori',
              data: customDates.map(date => stats.daily_trends[date].amount || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'To\'lovlar soni',
              data: customDates.map(date => stats.daily_trends[date].count || 0),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              yAxisID: 'y1',
            }
          ],
        };
      default:
        return {
          labels: [],
          datasets: [],
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">To'lov statistikasi</h1>
        <div className="flex gap-4">
          <select
            value={period}
            onChange={handlePeriodChange}
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-800 text-white border-gray-700' 
                : 'bg-white text-gray-900 border-gray-300'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="daily">Kunlik</option>
            <option value="weekly">Haftalik</option>
            <option value="monthly">Oylik</option>
            <option value="yearly">Yillik</option>
            <option value="custom">Maxsus</option>
          </select>
          
          {period === 'custom' ? (
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={handleDateChange}
                name="startDate"
                placeholder="Boshlanish sanasi"
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <input
                type="date"
                value={endDate}
                onChange={handleDateChange}
                name="endDate"
                placeholder="Tugash sanasi"
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          ) : period === 'yearly' ? (
            <input
              type="number"
              value={startDate.split('-')[0]}
              onChange={handleYearChange}
              onBlur={handleYearBlur}
              placeholder="YYYY"
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              min="2000"
              max="2100"
            />
          ) : (
            <input
              type={period === 'monthly' ? 'month' : 'date'}
              value={startDate}
              onChange={handleDateChange}
              name="startDate"
              placeholder={period === 'monthly' ? 'Oyni tanlang' : 'Sana tanlang'}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          )}
        </div>
      </div>

      {/* Period Display */}
      <div className={`p-4 rounded-lg mb-6 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <p className="text-sm text-gray-500">
          {format(parseISO(stats.period.start), 'dd MMMM yyyy', { locale: uz })} - {format(parseISO(stats.period.end), 'dd MMMM yyyy', { locale: uz })}
        </p>
      </div>

      {/* Main Chart */}
      <div className={`p-6 rounded-xl shadow-lg mb-8 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className="text-lg font-semibold mb-4">
          {period === 'daily' && 'Kunlik to\'lovlar'}
          {period === 'weekly' && 'Haftalik to\'lovlar'}
          {period === 'monthly' && 'Oylik to\'lovlar'}
          {period === 'yearly' && 'Yillik to\'lovlar'}
          {period === 'custom' && 'Maxsus davr to\'lovlar'}
        </h3>
        <div className="h-[400px]">
          <Bar
            data={getMainChartData()}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.dataset.label || '';
                      const value = context.raw;
                      if (context.dataset.yAxisID === 'y') {
                        return `${label}: ${formatCurrency(value)}`;
                      }
                      return `${label}: ${value}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'To\'lov miqdori'
                  },
                  ticks: {
                    callback: function(value) {
                      return formatCurrency(value);
                    }
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'To\'lovlar soni'
                  },
                  grid: {
                    drawOnChartArea: false
                  }
                }
              },
            }}
          />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Jami to\'lovlar</h3>
          <p className="text-2xl font-bold text-blue-500">
            {stats.summary.total_payments}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Jami summa</h3>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(stats.summary.total_amount)}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">O\'rtacha to\'lov</h3>
          <p className="text-2xl font-bold text-yellow-500">
            {formatCurrency(stats.summary.average_payment)}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">To\'lov turlari</h3>
          <div className="space-y-2">
            {Object.entries(stats.by_payment_type || {}).map(([type, amount]) => (
              <p key={type} className="text-sm">
                {type === 'cash' ? 'Naqd pul' : type === 'card' ? 'Plastik karta' : 'Bank o\'tkazmasi'}: {formatCurrency(amount)}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Status */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">To\'lov holatlari</h3>
          <div className="space-y-4">
            {Object.entries(stats.by_status || {}).map(([status, count]) => (
              <div key={status}>
                <p className="text-sm text-gray-500">
                  {status === 'completed' ? 'Yakunlangan' : 
                   status === 'pending' ? 'Kutilmoqda' : 
                   status === 'cancelled' ? 'Bekor qilingan' : status}
                </p>
                <p className="text-xl font-semibold">{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Course Distribution */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Kurslar bo\'yicha</h3>
          <div className="space-y-4">
            {Object.entries(stats.by_course || {}).map(([course, data]) => (
              <div key={course}>
                <p className="text-sm text-gray-500">{course}</p>
                <p className="text-xl font-semibold">{formatCurrency(data.total_amount)}</p>
                <p className="text-sm">To\'lovlar soni: {data.payment_count}</p>
                <p className="text-sm">O\'quvchilar soni: {data.unique_students}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
