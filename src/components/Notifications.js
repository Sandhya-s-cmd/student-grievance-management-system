import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  VideoCameraIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = () => {
    // Get user-specific notifications
    const userNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    setNotifications(userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    setUnreadCount(userNotifications.filter(n => n.status === 'unread').length);
  };

  const markAsRead = (notificationId) => {
    const userNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    const updatedNotifications = userNotifications.map(n => {
      if (n.id === notificationId) {
        return { ...n, status: 'read', readAt: new Date().toISOString() };
      }
      return n;
    });
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    loadNotifications();
  };

  const markAllAsRead = () => {
    const userNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    const updatedNotifications = userNotifications.map(n => ({
      ...n,
      status: 'read',
      readAt: new Date().toISOString()
    }));
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    loadNotifications();
  };

  const deleteNotification = (notificationId) => {
    const userNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    const updatedNotifications = userNotifications.filter(n => n.id !== notificationId);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mediation_scheduled':
        return <CalendarIcon className="h-5 w-5 text-blue-600" />;
      case 'mediation_updated':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatNotificationMessage = (message) => {
    // Clean up the message and format it nicely
    return message.split('\n').filter(line => line.trim()).map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.includes(':')) {
        const [key, value] = trimmedLine.split(':');
        return (
          <div key={index} className="flex">
            <span className="font-medium text-gray-700 mr-2">{key}:</span>
            <span className="text-gray-600">{value}</span>
          </div>
        );
      }
      return <div key={index} className="text-gray-600">{trimmedLine}</div>;
    });
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <BellIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    notification.status === 'unread' ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          {notification.status === 'unread' && (
                            <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <XMarkIcon className="h-3 w-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {formatNotificationMessage(notification.message)}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        {notification.status === 'unread' && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
