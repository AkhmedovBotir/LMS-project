'use client';

import { useState, useEffect } from 'react';
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

export default function Dashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [stats, setStats] = useState({
    period: {},
    financial: {},
    payments: {},
    salaries: {},
    groups: {},
    marketing: {},
    transactions: {},
    attendance: {},
    students: {},
    courses: {}
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const response = await axios.get(`http://localhost:5000/api/dashboard/stats?period=${period}`, {
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
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('uz-UZ').format(number);
  };

  const formatPercentage = (number) => {
    return `${number}%`;
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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
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
        </select>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Jami tushum</h3>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(stats.financial?.total_income || 0)}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Jami xarajat</h3>
          <p className="text-2xl font-bold text-red-500">
            {formatCurrency(stats.financial?.total_expenses || 0)}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Sof foyda</h3>
          <p className="text-2xl font-bold text-blue-500">
            {formatCurrency(stats.financial?.net_income || 0)}
          </p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Foyda marjasi</h3>
          <p className="text-2xl font-bold text-purple-500">
            {formatPercentage(stats.financial?.profit_margin || 0)}
                </p>
              </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income vs Expenses Line Chart */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Tushum va xarajatlar</h3>
          <Line
            data={{
              labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun'],
              datasets: [
                {
                  label: 'Tushum',
                  data: [
                    stats.transactions?.total_income || 0,
                    stats.payments?.total_amount || 0,
                    stats.financial?.total_income || 0,
                    stats.transactions?.income_transactions || 0,
                    stats.payments?.by_status?.completed || 0,
                    stats.financial?.net_income || 0
                  ],
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.5)',
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: 'Xarajat',
                  data: [
                    stats.transactions?.total_expenses || 0,
                    stats.salaries?.total_amount || 0,
                    stats.financial?.total_expenses || 0,
                    stats.transactions?.expense_transactions || 0,
                    stats.salaries?.by_status?.paid || 0,
                    stats.financial?.net_income || 0
                  ],
                  borderColor: 'rgb(239, 68, 68)',
                  backgroundColor: 'rgba(239, 68, 68, 0.5)',
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: 'Sof foyda',
                  data: [
                    stats.transactions?.net_amount || 0,
                    stats.payments?.total_amount - stats.salaries?.total_amount || 0,
                    stats.financial?.net_income || 0,
                    stats.transactions?.income_transactions - stats.transactions?.expense_transactions || 0,
                    stats.payments?.by_status?.completed - stats.salaries?.by_status?.paid || 0,
                    stats.financial?.net_income || 0
                  ],
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  tension: 0.4,
                  fill: true,
                }
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('uz-UZ', {
                          style: 'currency',
                          currency: 'UZS',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(context.parsed.y);
                      }
                      return label;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  suggestedMin: 0,
                  suggestedMax: Math.max(
                    stats.transactions?.total_income || 0,
                    stats.transactions?.total_expenses || 0,
                    stats.payments?.total_amount || 0,
                    stats.salaries?.total_amount || 0
                  ) * 1.2,
                  ticks: {
                    callback: function(value) {
                      return new Intl.NumberFormat('uz-UZ', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(value);
                    }
                  }
                }
              },
              interaction: {
                intersect: false,
                mode: 'index'
              }
            }}
          />
        </div>

        {/* Payment Distribution Doughnut Chart */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">To'lov turlari</h3>
          <Doughnut
            data={{
              labels: ['Naqd pul', 'Plastik', 'O\'tkazma'],
              datasets: [
                {
                  data: [
                    stats.payments?.by_type?.cash || 0,
                    stats.payments?.by_type?.card || 0,
                    stats.payments?.by_type?.transfer || 0,
                  ],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.5)',
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(168, 85, 247, 0.5)',
                  ],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }}
          />
        </div>

        {/* Attendance Statistics Polar Area Chart */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Davomat statistikasi</h3>
          <PolarArea
            data={{
              labels: ['Kelgan', 'Kelmagan', 'Kechikkan'],
              datasets: [
                {
                  data: [
                    stats.attendance?.by_status?.present || 0,
                    stats.attendance?.by_status?.absent || 0,
                    stats.attendance?.by_status?.late || 0,
                  ],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.5)',
                    'rgba(239, 68, 68, 0.5)',
                    'rgba(234, 179, 8, 0.5)',
                  ],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }}
          />
        </div>

        {/* Group Statistics Chart */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Guruhlar statistikasi</h3>
          <Bar
            data={{
              labels: Object.keys(stats.groups?.by_course || {}),
              datasets: [
                {
                  type: 'bar',
                  label: 'O\'quvchilar soni',
                  data: Object.values(stats.groups?.by_course || {}).map(course => course.students || 0),
                  backgroundColor: 'rgba(59, 130, 246, 0.7)',
                  borderColor: 'rgb(59, 130, 246)',
                  borderWidth: 1,
                  borderRadius: 5,
                  order: 2
                },
                {
                  type: 'bar',
                  label: 'Guruhlar soni',
                  data: Object.values(stats.groups?.by_course || {}).map(course => course.groups || 0),
                  backgroundColor: 'rgba(234, 179, 8, 0.7)',
                  borderColor: 'rgb(234, 179, 8)',
                  borderWidth: 1,
                  borderRadius: 5,
                  order: 1
                },
                {
                  type: 'line',
                  label: 'Tushum',
                  data: Object.values(stats.groups?.by_course || {}).map(course => course.revenue || 0),
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  yAxisID: 'y1',
                  order: 0
                }
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        if (context.dataset.label === 'Tushum') {
                          label += new Intl.NumberFormat('uz-UZ', {
                            style: 'currency',
                            currency: 'UZS',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(context.parsed.y);
                        } else {
                          label += context.parsed.y;
                        }
                      }
                      return label;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  suggestedMin: 0,
                  suggestedMax: Math.max(
                    ...Object.values(stats.groups?.by_course || {}).map(course => course.students || 0),
                    ...Object.values(stats.groups?.by_course || {}).map(course => course.groups || 0)
                  ) * 1.2,
                  title: {
                    display: true,
                    text: 'Soni'
                  }
                },
                y1: {
                  beginAtZero: true,
                  suggestedMin: 0,
                  suggestedMax: Math.max(
                    ...Object.values(stats.groups?.by_course || {}).map(course => course.revenue || 0)
                  ) * 1.2,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Tushum'
                  },
                  grid: {
                    drawOnChartArea: false
                  },
                  ticks: {
                    callback: function(value) {
                      return new Intl.NumberFormat('uz-UZ', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(value);
                    }
                  }
                }
              },
              interaction: {
                intersect: false,
                mode: 'index'
              }
            }}
          />
              </div>
            </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Marketing Statistics */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Marketing statistikasi</h3>
          <div className="space-y-2">
            <p>Jami kampaniyalar: {stats.marketing?.total_campaigns || 0}</p>
            <p>Aktiv kampaniyalar: {stats.marketing?.by_status?.active || 0}</p>
            <p>Yakunlangan kampaniyalar: {stats.marketing?.by_status?.completed || 0}</p>
            <p>Ijtimoiy tarmoqlar: {stats.marketing?.by_type?.social || 0}</p>
            <p>Bosma: {stats.marketing?.by_type?.print || 0}</p>
            <p>Onlayn: {stats.marketing?.by_type?.online || 0}</p>
          </div>
      </div>

        {/* Teacher Statistics */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">O\'qituvchilar statistikasi</h3>
          <div className="space-y-2">
            <p>Jami o\'qituvchilar: {stats.groups?.total_groups || 0}</p>
            <p>Aktiv o\'qituvchilar: {stats.groups?.active_groups || 0}</p>
            <p>Jami guruhlar: {stats.groups?.total_groups || 0}</p>
            <p>O\'rtacha maosh: {formatCurrency(stats.salaries?.average_salary || 0)}</p>
            <p>To\'langan maoshlar: {formatCurrency(stats.salaries?.by_status?.paid || 0)}</p>
            <p>Kutilayotgan maoshlar: {formatCurrency(stats.salaries?.by_status?.pending || 0)}</p>
          </div>
              </div>

        {/* Student Statistics */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className="text-lg font-semibold mb-4">O\'quvchilar statistikasi</h3>
          <div className="space-y-2">
            <p>Jami o\'quvchilar: {stats.students?.total_students || 0}</p>
            <p>Aktiv o\'quvchilar: {stats.students?.active_students || 0}</p>
            <p>To\'lov qilgan o\'quvchilar: {stats.students?.paid_students || 0}</p>
            <p>Sinov o\'quvchilari: {stats.students?.trial_students || 0}</p>
            <p>To\'lov qilmagan o\'quvchilar: {stats.students?.unpaid_students || 0}</p>
            <p>Muddati tugagan o\'quvchilar: {stats.students?.by_payment_status?.expired || 0}</p>
            </div>
        </div>
      </div>
    </div>
  );
} 