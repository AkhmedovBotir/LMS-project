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

export default function AttendanceStatistics() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({
    period: {},
    total_employees: 0,
    total_attendance_records: 0,
    by_status: {},
    by_employee: {},
    by_date: {},
    attendance_rate: '0',
    late_rate: '0',
    absence_rate: '0',
    average_checkin_time: '',
    average_checkout_time: '',
    most_common_status: '',
    status_distribution: {},
    weekly_trends: {},
    monthly_trends: {}
  });

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const url = new URL('http://localhost:5000/api/statistics-department/attendance');
      
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

  // Hafta raqamini olish uchun yordamchi funksiya
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    // Sana formatini tekshirish
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return;
    
    if (name === 'startDate') {
      setStartDate(value);
      // Agar yillik davr tanlangan bo'lsa
      if (period === 'yearly') {
        const year = value.split('-')[0];
        setStartDate(`${year}-01-01`);
        setEndDate(`${year}-12-31`);
      }
    } else if (name === 'endDate') {
      setEndDate(value);
      // Agar yillik davr tanlangan bo'lsa
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
    
    // Davr o'zgarganda sanalarni qayta o'rnatish
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
    return `${value}%`;
  };

  const formatTime = (time) => {
    return time || '00:00';
  };

  const getMainChartData = () => {
    const currentYear = new Date().getFullYear();
    
    switch (period) {
      case 'daily':
        // Kunlik ma'lumotlarni ko'rsatish
        const dailyDates = Object.keys(stats.by_date || {}).sort();
        return {
          labels: dailyDates,
          datasets: [
            {
              label: 'Kelgan',
              data: dailyDates.map(date => stats.by_date[date].present || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
            },
            {
              label: 'Kelmagan',
              data: dailyDates.map(date => stats.by_date[date].absent || 0),
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
            },
            {
              label: 'Kechikkan',
              data: dailyDates.map(date => stats.by_date[date].late || 0),
              backgroundColor: 'rgba(234, 179, 8, 0.7)',
            },
          ],
        };
      case 'weekly':
        // Haftalik ma'lumotlarni ko'rsatish
        const days = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
        const weeklyData = Object.keys(stats.weekly_trends || {}).sort();
        const currentWeek = weeklyData[0] || `${currentYear}-W${String(getWeekNumber(new Date())).padStart(2, '0')}`;
        
        // Hafta kunlarini olish
        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - date.getDay() + i);
          return date.toISOString().split('T')[0];
        });
        
        return {
          labels: days,
          datasets: [
            {
              label: 'Kelgan',
              data: weekDates.map(date => stats.by_date[date]?.present || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
            },
            {
              label: 'Kelmagan',
              data: weekDates.map(date => stats.by_date[date]?.absent || 0),
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
            },
            {
              label: 'Kechikkan',
              data: weekDates.map(date => stats.by_date[date]?.late || 0),
              backgroundColor: 'rgba(234, 179, 8, 0.7)',
            },
          ],
        };
      case 'monthly':
        // Oylik ma'lumotlarni ko'rsatish
        const monthlyData = Object.keys(stats.monthly_trends || {}).sort();
        const currentMonth = monthlyData[0] || `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        
        // Oydagi haftalar sonini aniqlash
        const [year, month] = currentMonth.split('-');
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const weeksInMonth = Math.ceil((lastDay.getDate() + firstDay.getDay()) / 7);
        
        // Haftalarni yaratish
        const weeks = Array.from({ length: weeksInMonth }, (_, i) => `${i + 1}-hafta`);
        
        return {
          labels: weeks,
          datasets: [
            {
              label: 'Kelgan',
              data: weeks.map((_, index) => {
                const weekKey = `${currentMonth.split('-')[0]}-W${String(index + 1).padStart(2, '0')}`;
                return stats.weekly_trends[weekKey]?.present || 0;
              }),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
            },
            {
              label: 'Kelmagan',
              data: weeks.map((_, index) => {
                const weekKey = `${currentMonth.split('-')[0]}-W${String(index + 1).padStart(2, '0')}`;
                return stats.weekly_trends[weekKey]?.absent || 0;
              }),
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
            },
            {
              label: 'Kechikkan',
              data: weeks.map((_, index) => {
                const weekKey = `${currentMonth.split('-')[0]}-W${String(index + 1).padStart(2, '0')}`;
                return stats.weekly_trends[weekKey]?.late || 0;
              }),
              backgroundColor: 'rgba(234, 179, 8, 0.7)',
            },
          ],
        };
      case 'yearly':
        // Yillik ma'lumotlarni oylar bo'yicha guruhlash
        const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
        const yearlyData = Object.keys(stats.monthly_trends || {}).sort();
        const selectedYear = yearlyData[0]?.split('-')[0] || currentYear.toString();
        
        return {
          labels: monthNames,
          datasets: [
            {
              label: 'Kelgan',
              data: monthNames.map((_, index) => {
                const monthKey = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
                return stats.monthly_trends[monthKey]?.present || 0;
              }),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
            },
            {
              label: 'Kelmagan',
              data: monthNames.map((_, index) => {
                const monthKey = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
                return stats.monthly_trends[monthKey]?.absent || 0;
              }),
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
            },
            {
              label: 'Kechikkan',
              data: monthNames.map((_, index) => {
                const monthKey = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
                return stats.monthly_trends[monthKey]?.late || 0;
              }),
              backgroundColor: 'rgba(234, 179, 8, 0.7)',
            },
          ],
        };
      case 'custom':
        // Maxsus davr uchun kunlik ma'lumotlarni ko'rsatish
        const customDates = Object.keys(stats.by_date || {}).sort();
        return {
          labels: customDates,
          datasets: [
            {
              label: 'Kelgan',
              data: customDates.map(date => stats.by_date[date].present || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
            },
            {
              label: 'Kelmagan',
              data: customDates.map(date => stats.by_date[date].absent || 0),
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
            },
            {
              label: 'Kechikkan',
              data: customDates.map(date => stats.by_date[date].late || 0),
              backgroundColor: 'rgba(234, 179, 8, 0.7)',
            },
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
        <h1 className="text-2xl font-bold">Davomat statistikasi</h1>
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

      {/* Main Chart */}
      <div className={`p-6 rounded-xl shadow-lg mb-8 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className="text-lg font-semibold mb-4">
          {period === 'daily' && 'Kunlik davomat'}
          {period === 'weekly' && 'Haftalik davomat'}
          {period === 'monthly' && 'Oylik davomat'}
          {period === 'yearly' && 'Yillik davomat'}
          {period === 'custom' && 'Maxsus davr davomat'}
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
              },
              scales: {
                y: {
                  beginAtZero: true,
                  stacked: true,
                },
                x: {
                  stacked: true,
                },
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
          <h3 className="text-lg font-semibold mb-2">Jami xodimlar</h3>
          <p className="text-2xl font-bold text-blue-500">
            {stats.total_employees}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Davomat foizi</h3>
          <p className="text-2xl font-bold text-green-500">
            {formatPercentage(stats.attendance_rate)}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Kechikish foizi</h3>
          <p className="text-2xl font-bold text-yellow-500">
            {formatPercentage(stats.late_rate)}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Yo'qlik foizi</h3>
          <p className="text-2xl font-bold text-red-500">
            {formatPercentage(stats.absence_rate)}
          </p>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Times */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">O'rtacha vaqtlar</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">O'rtacha kirish vaqti</p>
              <p className="text-xl font-semibold">{formatTime(stats.average_checkin_time)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">O'rtacha chiqish vaqti</p>
              <p className="text-xl font-semibold">{formatTime(stats.average_checkout_time)}</p>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Holatlar taqsimoti</h3>
          <div className="space-y-4">
            {Object.entries(stats.status_distribution || {}).map(([status, percentage]) => (
              <div key={status}>
                <p className="text-sm text-gray-500">{status}</p>
                <p className="text-xl font-semibold">{formatPercentage(percentage)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
