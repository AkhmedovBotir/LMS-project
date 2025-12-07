'use client';

import { useTheme } from '@/app/context/ThemeContext';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { Menu, MenuItem, Avatar, IconButton, Switch } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Navbar({ isSidebarOpen, setIsSidebarOpen }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    Cookies.remove('token');
    router.push('/login');
  };

  return (
    <nav className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-md`}>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
        >
          <MenuIcon />
        </button>
        <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-800'}`}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </button>

        <div className="relative">
          <button
            onClick={handleMenuOpen}
            className={`flex items-center space-x-2 p-2 rounded-full transition-all ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <Avatar className={`${isDarkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 text-gray-800'}`}>
              <PersonIcon />
            </Avatar>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Admin</span>
          </button>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            PaperProps={{
              className: `${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg rounded-md`,
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleLogout} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <LogoutIcon className="mr-2" />
              <span>Logout</span>
            </MenuItem>
          </Menu>
        </div>
      </div>
    </nav>
  );
}