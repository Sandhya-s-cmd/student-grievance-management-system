import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Notifications from './Notifications';

const Navbar = ({ user, setUser, setSidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadNotifications();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadNotifications = () => {
    // Load real notifications from localStorage
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const userNotifications = allNotifications.filter(n => {
      // Match by userId or userEmail
      const matchesUser = (n.userId === user.id) || (n.userEmail === user.email);
      // Only show unread notifications
      const isUnread = !n.read;
      return matchesUser && isUnread;
    });
    setNotifications(userNotifications);
  };

  const markNotificationAsRead = (notificationId) => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = allNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    loadNotifications();
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    markNotificationAsRead(notification.id);
    
    // Navigate to relevant page based on notification type
    if (notification.complaintId) {
      window.location.href = `/complaints/${notification.complaintId}`;
    }
    
    // Close notifications dropdown
    setShowNotifications(false);
  };

  const handleLogout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      
      // Clear session storage as well
      sessionStorage.clear();
      
      // Update state
      setUser(null);
      setShowUserMenu(false);
      
      // Force page reload to clear any cached state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force redirect even if cleanup fails
      window.location.href = '/login';
    }
  };

  return (
    <nav className="bg-gradient-to-r from-white to-purple-50 shadow-lg border-b border-purple-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden transition-all duration-200"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SG</span>
              </div>
              <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-900 to-blue-900 bg-clip-text text-transparent">
                Grievance Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Notifications user={user} />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-purple-200 ring-opacity-50 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-100 transition-colors duration-200"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
