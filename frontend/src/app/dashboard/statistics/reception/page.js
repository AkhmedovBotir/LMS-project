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

export default function ReceptionStatistics() {
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
      total_receptions: 0,
      converted_to_students: 0,
      contacted: 0,
      not_contacted: 0,
      conversion_rate: 0
    },
    by_source: {},
    by_course: {},
    daily_trends: {}
  });

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const url = new URL('http://localhost:5000/api/statistics-department/reception');
      
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
      } else {
        throw new Error(response.data.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
      setStats({
        period: {
          start: '',
          end: ''
        },
        summary: {
          total_receptions: 0,
          converted_to_students: 0,
          contacted: 0,
          not_contacted: 0,
          conversion_rate: '0.00'
        },
        by_source: {},
        by_course: {},
        daily_trends: {}
      });
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

  const formatPercentage = (value) => {
    if (typeof value === 'string') {
      return `${value}%`;
    }
    if (typeof value !== 'number' || isNaN(value)) {
      return '0.00%';
    }
    return `${value.toFixed(2)}%`;
  };

  const getMainChartData = () => {
    switch (period) {
      case 'daily':
        const dailyDates = Object.keys(stats.daily_trends || {}).sort();
        return {
          labels: dailyDates.map(date => format(parseISO(date), 'dd MMMM', { locale: uz })),
          datasets: [
            {
              label: 'Jami qabullar',
              data: dailyDates.map(date => stats.daily_trends[date].total || 0),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'O\'quvchilarga aylangan',
              data: dailyDates.map(date => stats.daily_trends[date].converted || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'Konversiya foizi',
              data: dailyDates.map(date => stats.daily_trends[date].conversion_rate || 0),
              backgroundColor: 'rgba(234, 179, 8, 0.7)',
              yAxisID: 'y1',
              type: 'line',
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
              label: 'Jami qabullar',
              data: weekDates.map(date => stats.daily_trends[date]?.total || 0),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'O\'quvchilarga aylangan',
              data: weekDates.map(date => stats.daily_trends[date]?.converted || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'Konversiya foizi',
              data: weekDates.map(date => stats.daily_trends[date]?.conversion_rate || 0),
              backgroundColor: 'rgba(234, 179, 8, 0.7)',
              yAxisID: 'y1',
              type: 'line',
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
              total: acc.total + (course.total || 0),
              converted: acc.converted + (course.converted || 0),
              conversion_rate: ((acc.converted + (course.converted || 0)) / (acc.total + (course.total || 0))) * 100 || 0
            }), { total: 0, converted: 0, conversion_rate: 0 });
          return monthData;
        });

        return {
          labels: monthNames,
          datasets: [
            {
              label: 'Jami qabullar',
              data: monthlyData.map(data => data.total),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'O\'quvchilarga aylangan',
              data: monthlyData.map(data => data.converted),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'Konversiya foizi',
              data: monthlyData.map(data => data.conversion_rate),
              backgroundColor: 'rgba(234, 179, 8, 0.7)',
              yAxisID: 'y1',
              type: 'line',
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
              total: acc.total + (course.total || 0),
              converted: acc.converted + (course.converted || 0),
              conversion_rate: ((acc.converted + (course.converted || 0)) / (acc.total + (course.total || 0))) * 100 || 0
            }), { total: 0, converted: 0, conversion_rate: 0 });
          return yearData;
        });

        return {
          labels: years,
          datasets: [
            {
              label: 'Jami qabullar',
              data: yearlyData.map(data => data.total),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'O\'quvchilarga aylangan',
              data: yearlyData.map(data => data.converted),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'Konversiya foizi',
              data: yearlyData.map(data => data.conversion_rate),
              backgroundColor: 'rgba(234, 179, 8, 0.7)',
              yAxisID: 'y1',
              type: 'line',
            }
          ],
        };
      case 'custom':
        const customDates = Object.keys(stats.daily_trends || {}).sort();
        return {
          labels: customDates.map(date => format(parseISO(date), 'dd MMMM', { locale: uz })),
          datasets: [
            {
              label: 'Jami qabullar',
              data: customDates.map(date => stats.daily_trends[date].total || 0),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'O\'quvchilarga aylangan',
              data: customDates.map(date => stats.daily_trends[date].converted || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'Konversiya foizi',
              data: customDates.map(date => stats.daily_trends[date].conversion_rate || 0),
              backgroundColor: 'rgba(234, 179, 8, 0.7)',
              yAxisID: 'y1',
              type: 'line',
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
        <h1 className="text-2xl font-bold">Qabul statistikasi</h1>
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
          {period === 'daily' && 'Kunlik qabullar'}
          {period === 'weekly' && 'Haftalik qabullar'}
          {period === 'monthly' && 'Oylik qabullar'}
          {period === 'yearly' && 'Yillik qabullar'}
          {period === 'custom' && 'Maxsus davr qabullar'}
        </h3>
        <div className="h-[400px]">
          {Object.keys(stats.daily_trends || {}).length > 0 ? (
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
                        if (context.dataset.yAxisID === 'y1') {
                          return `${label}: ${formatPercentage(value)}`;
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
                      text: 'Qabullar soni'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Konversiya foizi'
                    },
                    grid: {
                      drawOnChartArea: false
                    },
                    ticks: {
                      callback: function(value) {
                        return formatPercentage(value);
                      }
                    }
                  }
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Ma'lumot mavjud emas</p>
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Jami qabullar</h3>
          <p className="text-2xl font-bold text-blue-500">
            {stats.summary?.total_receptions || 0}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">O\'quvchilarga aylangan</h3>
          <p className="text-2xl font-bold text-green-500">
            {stats.summary?.converted_to_students || 0}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Konversiya foizi</h3>
          <p className="text-2xl font-bold text-yellow-500">
            {formatPercentage(stats.summary?.conversion_rate || '0.00')}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Bog\'lanish holati</h3>
          <div className="space-y-2">
            <p className="text-sm">Bog\'langan: {stats.summary?.contacted || 0}</p>
            <p className="text-sm">Bog\'lanilmagan: {stats.summary?.not_contacted || 0}</p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Manbalar bo'yicha</h3>
          <div className="space-y-4">
            {Object.entries(stats.by_source || {}).map(([source, data]) => (
              <div key={source}>
                <p className="text-sm text-gray-500">
                  {source === 'website' ? 'Veb-sayt' : 
                   source === 'instagram' ? 'Instagram' : 
                   source === 'telegram' ? 'Telegram' : 
                   source === 'facebook' ? 'Facebook' : 
                   source === 'unknown' ? 'Noma\'lum' : source}
                </p>
                <p className="text-xl font-semibold">Jami: {data.total}</p>
                <p className="text-sm">Aylangan: {data.converted}</p>
                <p className="text-sm">Konversiya: {formatPercentage(data.conversion_rate)}</p>
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
                <p className="text-xl font-semibold">Jami: {data.total}</p>
                <p className="text-sm">Aylangan: {data.converted}</p>
                <p className="text-sm">Konversiya: {formatPercentage(data.conversion_rate)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
