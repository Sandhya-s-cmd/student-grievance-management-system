import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Settings = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    studentId: user?.studentId || '',
    bio: ''
  });

  // Password Settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    complaintUpdates: true,
    resolutionAlerts: true,
    systemAnnouncements: false
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showContactInfo: false,
    allowDirectMessages: true,
    dataSharing: false
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'en',
    fontSize: 'medium',
    sidebarCollapsed: false
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    if (savedSettings.notifications) {
      setNotificationSettings(savedSettings.notifications);
    }
    if (savedSettings.privacy) {
      setPrivacySettings(savedSettings.privacy);
    }
    if (savedSettings.appearance) {
      setAppearanceSettings(savedSettings.appearance);
    }
  }, []);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: EyeIcon },
    { id: 'appearance', name: 'Appearance', icon: CogIcon }
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user data in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...profileData };
        localStorage.setItem('users', JSON.stringify(users));
        setSuccessMessage('Profile updated successfully!');
      }
    } catch (error) {
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters long' });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update password in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex].password = btoa(passwordData.newPassword);
        localStorage.setItem('users', JSON.stringify(users));
        setSuccessMessage('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to update password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (category, settings) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage
      const currentSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      currentSettings[category] = settings;
      localStorage.setItem('userSettings', JSON.stringify(currentSettings));
      
      setSuccessMessage(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully!`);
    } catch (error) {
      setErrors({ submit: `Failed to save ${category} settings.` });
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Personal Information</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  value={profileData.department}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            {user.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <input
                  type="text"
                  value={profileData.studentId}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                rows={4}
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                >
                  {showPasswords.current ? <EyeSlashIcon className="h-4 w-4 text-gray-400" /> : <EyeIcon className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                >
                  {showPasswords.new ? <EyeSlashIcon className="h-4 w-4 text-gray-400" /> : <EyeIcon className="h-4 w-4 text-gray-400 />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                >
                  {showPasswords.confirm ? <EyeSlashIcon className="h-4 w-4 text-gray-400" /> : <EyeIcon className="h-4 w-4 text-gray-400 />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Enable 2FA</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  notificationSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${
                  notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  notificationSettings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${
                  notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, smsNotifications: !prev.smsNotifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  notificationSettings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${
                  notificationSettings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Complaint Updates</p>
                <p className="text-sm text-gray-500">Get notified when your complaint status changes</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, complaintUpdates: !prev.complaintUpdates }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  notificationSettings.complaintUpdates ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${
                  notificationSettings.complaintUpdates ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Resolution Alerts</p>
                <p className="text-sm text-gray-500">Get notified when complaints are resolved</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, resolutionAlerts: !prev.resolutionAlerts }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  notificationSettings.resolutionAlerts ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${
                  notificationSettings.resolutionAlerts ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">System Announcements</p>
                <p className="text-sm text-gray-500">Receive system updates and announcements</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, systemAnnouncements: !prev.systemAnnouncements }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  notificationSettings.systemAnnouncements ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${
                  notificationSettings.systemAnnouncements ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => saveSettings('notifications', notificationSettings)}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Notification Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
              <select
                value={privacySettings.profileVisibility}
                onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Show Contact Information</p>
                <p className="text-sm text-gray-500">Display your email and phone in your profile</p>
              </div>
              <button
                onClick={() => setPrivacySettings(prev => ({ ...prev, showContactInfo: !prev.showContactInfo }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  privacySettings.showContactInfo ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${
                  privacySettings.showContactInfo ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Allow Direct Messages</p>
                <p className="text-sm text-gray-500">Let other users send you messages</p>
              </div>
              <button
                onClick={() => setPrivacySettings(prev => ({ ...prev, allowDirectMessages: !prev.allowDirectMessages }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  privacySettings.allowDirectMessages ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${
                  privacySettings.allowDirectMessages ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Data Sharing</p>
                <p className="text-sm text-gray-500">Share anonymous usage data to improve the service</p>
              </div>
              <button
                onClick={() => setPrivacySettings(prev => ({ ...prev, dataSharing: !prev.dataSharing }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  privacySettings.dataSharing ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${
                  privacySettings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => saveSettings('privacy', privacySettings)}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Appearance Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select
                value={appearanceSettings.theme}
                onChange={(e) => setAppearanceSettings(prev => ({ ...prev, theme: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={appearanceSettings.language}
                onChange={(e) => setAppearanceSettings(prev => ({ ...prev, language: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
              <select
                value={appearanceSettings.fontSize}
                onChange={(e) => setAppearanceSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Collapse Sidebar</p>
                <p className="text-sm text-gray-500">Keep sidebar collapsed by default</p>
              </div>
              <button
                onClick={() => setAppearanceSettings(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  appearanceSettings.sidebarCollapsed ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${
                  appearanceSettings.sidebarCollapsed ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => saveSettings('appearance', appearanceSettings)}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Appearance Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'appearance':
        return renderAppearanceTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <p className="ml-3 text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-800">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;
