import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ChartBarIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ user, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['student', 'admin', 'authority'] },
    { name: 'My Complaints', href: '/complaints', icon: DocumentTextIcon, roles: ['student'] },
    { name: 'All Complaints', href: '/complaints', icon: DocumentTextIcon, roles: ['admin', 'authority'] },
    { name: 'Mediation Management', href: '/mediation-management', icon: CalendarIcon, roles: ['admin'] },
    { name: 'Submit Complaint', href: '/submit-complaint', icon: PlusCircleIcon, roles: ['student', 'authority'] },
    { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['student', 'admin', 'authority'] },
    { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon, roles: ['student', 'admin', 'authority'] },
  ];

  const filteredNavigation = navigation.filter(item => item.roles.includes(user.role));

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gradient-to-br from-purple-600 to-blue-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-purple-50 shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-purple-200 lg:hidden">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-900 to-blue-900 bg-clip-text text-transparent">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-gray-400 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 transition-all duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 transform hover:scale-105
                  ${isActive(item.href)
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-r-2 border-purple-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                    ${isActive(item.href) ? 'text-purple-700' : 'text-gray-400 group-hover:text-purple-600'}
                  `}
                />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* User info card */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName || user.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
