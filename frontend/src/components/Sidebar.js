'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Group,
  Groups,
  Business,
  ExpandMore,
  ExpandLess,
  Badge,
  DocumentScanner,
  CalendarMonth,
  BookSharp,
  ListAltSharp,
  GroupAddOutlined,
  AccountBalanceWallet,
  Payments,
  ReceiptLong,
  AccountBalance,
  Assessment,
  Map,
  ContactMail
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import { ComputerDesktopIcon } from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Boshqaruv paneli', path: '/dashboard', icon: DashboardIcon },
  { name: 'Adminlar', path: '/dashboard/admins', icon: Groups },
  { name: 'Marketing Xarita', path: '/dashboard/marketing', icon: Map },
];

const hrMenuItems = [
  { name: 'Bo\'limlar', path: '/dashboard/hr/departments', icon: Business },
  { name: 'Lavozimlar', path: '/dashboard/hr/positions', icon: Badge },
  { name: 'Xodimlar', path: '/dashboard/hr/employees', icon: PeopleIcon },
  { name: 'Resumelar', path: '/dashboard/hr/resumes', icon: DocumentScanner },
  { name: 'Davomat', path: '/dashboard/hr/attendance', icon: CalendarMonth },
];

const receptionMenuItems = [
  { name: 'Qabul', path: '/dashboard/reception/reception', icon: ReceiptIcon },
  { name: 'Kurslar', path: '/dashboard/reception/courses', icon: BookSharp },
  { name: 'Guruhlar', path: '/dashboard/reception/groups', icon: Groups },
  { name: 'O\'quvchilar', path: '/dashboard/reception/students', icon: ListAltSharp },
  { name: 'Guruh biriktirish', path: '/dashboard/reception/group-students', icon: GroupAddOutlined },
  { name: 'To\'lovlar', path: '/dashboard/reception/payments', icon: ReceiptIcon },
  { name: 'Davomat', path: '/dashboard/reception/attendance-students', icon: CalendarMonth },
];

const accountingMenuItems = [
  { name: 'Kirim-chiqim', path: '/dashboard/accounting/transactions', icon: AccountBalanceWallet },
  { name: 'Oylik maoshlar', path: '/dashboard/accounting/salaries', icon: AccountBalance },
];

const statisticsDepartmentMenuItems = [
  { name: 'Xodimlar davomat', path: '/dashboard/statistics/attendance', icon: Assessment },
  { name: 'To\'lovlar', path: '/dashboard/statistics/payments', icon: ReceiptIcon },
  { name: 'Qabulxona', path: '/dashboard/statistics/reception', icon: ReceiptLong },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  const [isHrOpen, setIsHrOpen] = useState(false);
  const [isReceptionOpen, setIsReceptionOpen] = useState(false);
  const [isAccountingOpen, setIsAccountingOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);

  return (
    <div
      className={`h-screen flex flex-col ${isOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 ease-in-out ${isDarkMode ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-gray-200'
        }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {isOpen && (
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-gray-800'}`}>
            SARGET ERP
          </h1>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'
            }`}
        >
          {isOpen ? (
            <ChevronLeftIcon />
          ) : (
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Tooltip
              key={item.path}
              title={!isOpen ? item.name : ''}
              placement="right"
              arrow
            >
              <Link
                href={item.path}
                className={`flex items-center mx-2 my-1 px-3 py-3 rounded-lg transition-all ${isActive
                  ? isDarkMode
                    ? 'bg-gray-800 text-yellow-400 shadow-lg'
                    : 'bg-yellow-50 text-yellow-600 shadow-md'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon
                  className={`${isOpen ? 'mr-3' : 'mx-auto'} ${isActive ? 'text-inherit' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                />
                {isOpen && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            </Tooltip>
          );
        })}

        {/* HR Dropdown */}
        <div className="mx-2 my-1">
          <Tooltip
            title={!isOpen ? 'HR' : ''}
            placement="right"
            arrow
          >
            <button
              onClick={() => setIsHrOpen(!isHrOpen)}
              className={`flex items-center w-full px-3 py-3 rounded-lg transition-all ${isDarkMode
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Group
                className={`${isOpen ? 'mr-3' : 'mx-auto'} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              />
              {isOpen && (
                <>
                  <span className="font-medium flex-1 text-left">HR</span>
                  {isHrOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </button>
          </Tooltip>

          {isOpen && isHrOpen && (
            <div className={`ml-8 mt-1 ${isDarkMode ? 'border-l border-gray-700' : 'border-l border-gray-200'}`}>
              {hrMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Tooltip
                    key={item.path}
                    title={!isOpen ? item.name : ''}
                    placement="right"
                    arrow
                  >
                    <Link
                      href={item.path}
                      className={`flex items-center mx-2 my-1 px-3 py-2 rounded-lg transition-all ${isActive
                        ? isDarkMode
                          ? 'bg-gray-800 text-yellow-400 shadow-lg'
                          : 'bg-yellow-50 text-yellow-600 shadow-md'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Icon
                        className={`mr-3 ${isActive ? 'text-inherit' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>

        {/* Reception Dropdown */}
        <div className="mx-2 my-1">
          <Tooltip
            title={!isOpen ? 'Qabulxona' : ''}
            placement="right"
            arrow
          >
            <button
              onClick={() => setIsReceptionOpen(!isReceptionOpen)}
              className={`flex items-center w-full px-3 py-3 rounded-lg transition-all ${isDarkMode
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <ReceiptIcon
                className={`${isOpen ? 'mr-3' : 'mx-auto'} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              />
              {isOpen && (
                <>
                  <span className="font-medium flex-1 text-left">Qabulxona</span>
                  {isReceptionOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </button>
          </Tooltip>

          {isOpen && isReceptionOpen && (
            <div className={`ml-8 mt-1 ${isDarkMode ? 'border-l border-gray-700' : 'border-l border-gray-200'}`}>
              {receptionMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Tooltip
                    key={item.path}
                    title={!isOpen ? item.name : ''}
                    placement="right"
                    arrow
                  >
                    <Link
                      href={item.path}
                      className={`flex items-center mx-2 my-1 px-3 py-2 rounded-lg transition-all ${isActive
                        ? isDarkMode
                          ? 'bg-gray-800 text-yellow-400 shadow-lg'
                          : 'bg-yellow-50 text-yellow-600 shadow-md'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Icon
                        className={`mr-3 ${isActive ? 'text-inherit' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>

        {/* Accounting Dropdown */}
        <div className="mx-2 my-1">
          <Tooltip
            title={!isOpen ? 'Buhgalteriya' : ''}
            placement="right"
            arrow
          >
            <button
              onClick={() => setIsAccountingOpen(!isAccountingOpen)}
              className={`flex items-center w-full px-3 py-3 rounded-lg transition-all ${isDarkMode
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <AccountBalanceWallet
                className={`${isOpen ? 'mr-3' : 'mx-auto'} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              />
              {isOpen && (
                <>
                  <span className="font-medium flex-1 text-left">Buhgalteriya</span>
                  {isAccountingOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </button>
          </Tooltip>

          {isOpen && isAccountingOpen && (
            <div className={`ml-8 mt-1 ${isDarkMode ? 'border-l border-gray-700' : 'border-l border-gray-200'}`}>
              {accountingMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Tooltip
                    key={item.path}
                    title={!isOpen ? item.name : ''}
                    placement="right"
                    arrow
                  >
                    <Link
                      href={item.path}
                      className={`flex items-center mx-2 my-1 px-3 py-2 rounded-lg transition-all ${isActive
                        ? isDarkMode
                          ? 'bg-gray-800 text-yellow-400 shadow-lg'
                          : 'bg-yellow-50 text-yellow-600 shadow-md'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Icon
                        className={`mr-3 ${isActive ? 'text-inherit' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>

        {/* Statistics Department Dropdown */}
        <div className="mx-2 my-1">
          <Tooltip
            title={!isOpen ? 'Statistika bo\'limi' : ''}
            placement="right"
            arrow
          >
            <button
              onClick={() => setIsStatisticsOpen(!isStatisticsOpen)}
              className={`flex items-center w-full px-3 py-3 rounded-lg transition-all ${isDarkMode
                  ? 'text-gray-300 hover:bg-gray-800'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Assessment
                className={`${isOpen ? 'mr-3' : 'mx-auto'} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              />
              {isOpen && (
                <>
                  <span className="font-medium flex-1 text-left">Statistika bo'limi</span>
                  {isStatisticsOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </button>
          </Tooltip>

          {isOpen && isStatisticsOpen && (
            <div className={`ml-8 mt-1 ${isDarkMode ? 'border-l border-gray-700' : 'border-l border-gray-200'}`}>
              {statisticsDepartmentMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Tooltip
                    key={item.path}
                    title={!isOpen ? item.name : ''}
                    placement="right"
                    arrow
                  >
                    <Link
                      href={item.path}
                      className={`flex items-center mx-2 my-1 px-3 py-2 rounded-lg transition-all ${isActive
                          ? isDarkMode
                            ? 'bg-gray-800 text-yellow-400 shadow-lg'
                            : 'bg-yellow-50 text-yellow-600 shadow-md'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-800'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Icon
                        className={`mr-3 ${isActive ? 'text-inherit' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>

        {/* Muammoli o\'quvchilar */}
        <Tooltip
          title={!isOpen ? 'Muammoli o\'quvchilar' : ''}
          placement="right"
          arrow
        >
          <Link
            href="/dashboard/contact"
            className={`flex items-center mx-2 my-1 px-3 py-3 rounded-lg transition-all ${pathname === '/dashboard/contact'
              ? isDarkMode
                ? 'bg-gray-800 text-yellow-400 shadow-lg'
                : 'bg-yellow-50 text-yellow-600 shadow-md'
              : isDarkMode
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <ContactMail
              className={`${isOpen ? 'mr-3' : 'mx-auto'} ${pathname === '/dashboard/contact' ? 'text-inherit' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
            />
            {isOpen && (
              <span className="font-medium">Muammoli o'quvchilar</span>
            )}
          </Link>
        </Tooltip>

      {/* Sozlamalar */}
      <Tooltip
        title={!isOpen ? 'Sozlamalar' : ''}
        placement="right"
        arrow
      >
        <Link
          href="/dashboard/settings"
          className={`flex items-center mx-2 my-1 px-3 py-3 rounded-lg transition-all ${pathname === '/dashboard/settings'
            ? isDarkMode
              ? 'bg-gray-800 text-yellow-400 shadow-lg'
              : 'bg-yellow-50 text-yellow-600 shadow-md'
            : isDarkMode
              ? 'text-gray-300 hover:bg-gray-800'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <SettingsIcon
            className={`${isOpen ? 'mr-3' : 'mx-auto'} ${pathname === '/dashboard/settings' ? 'text-inherit' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
          />
          {isOpen && (
            <span className="font-medium">Sozlamalar</span>
          )}
        </Link>
      </Tooltip>
    </nav>

      {/* Footer (ixtiyoriy) */ }
  <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
    {isOpen && (
      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        v1.0.0
      </div>
    )}
  </div>
    </div >
  );
}