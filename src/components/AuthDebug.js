import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  EyeIcon, 
  TrashIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AuthDebug = () => {
  const [users, setUsers] = useState([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  };

  const decryptPassword = (encryptedPassword) => {
    try {
      return atob(encryptedPassword);
    } catch (error) {
      return encryptedPassword;
    }
  };

  const verifyUserEmail = (userId) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          emailVerified: true,
          status: 'active',
          verifiedAt: new Date().toISOString()
        };
      }
      return user;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const deleteUser = (userId) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setSelectedUser(null);
  };

  const clearAllUsers = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAllUsers = () => {
    localStorage.removeItem('users');
    setUsers([]);
    setSelectedUser(null);
    setShowClearConfirm(false);
  };

  const createTestUser = () => {
    const testUser = {
      id: `USER_${Date.now()}`,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: btoa('password123'), // encrypted
      role: 'student',
      studentId: 'STU2024001',
      department: 'Computer Science',
      phone: '+1-234-567-8901',
      emailVerified: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      verificationCode: 'TEST123'
    };

    const updatedUsers = [...users, testUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <UserIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Authentication Debug Tool</h1>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={createTestUser}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Create Test User
                </button>
                <button
                  onClick={clearAllUsers}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Clear All Users
                </button>
                <button
                  onClick={loadUsers}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-900">
                  {users.filter(u => u.emailVerified).length}
                </div>
                <div className="text-sm text-green-600">Verified Emails</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-900">
                  {users.filter(u => !u.emailVerified).length}
                </div>
                <div className="text-sm text-yellow-600">Unverified Emails</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-900">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <div className="text-sm text-blue-600">Active Users</div>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Password
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No users found. Register a user or create a test user.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.studentId && (
                              <div className="text-xs text-gray-400">ID: {user.studentId}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.emailVerified ? (
                              <>
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <span className="text-sm text-green-600">Verified</span>
                              </>
                            ) : (
                              <>
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                                <span className="text-sm text-yellow-600">Not Verified</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Status: {user.status || 'unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'authority' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => setShowPasswords(!showPasswords)}
                              className="text-gray-400 hover:text-gray-600 mr-2"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <span className="text-sm text-gray-600">
                              {showPasswords ? decryptPassword(user.password) : '••••••••'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {!user.emailVerified && (
                              <button
                                onClick={() => verifyUserEmail(user.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Verify Email"
                              >
                                <ShieldCheckIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete User"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Clear All Users Confirmation Modal */}
            {showClearConfirm && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
                  
                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Clear All Users
                          </h3>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Are you sure you want to delete all users? This action cannot be undone and will remove all registered accounts from the system.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        onClick={confirmClearAllUsers}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Clear All Users
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Details Modal */}
            {selectedUser && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
                  
                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          User Details
                        </h3>
                        <button
                          onClick={() => setSelectedUser(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(selectedUser, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Login Instructions:</h3>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Users must have emailVerified: true to login</li>
                <li>• Click the shield icon to verify any unverified user's email</li>
                <li>• Use the test user (test@example.com / password123) for quick testing</li>
                <li>• Check the password field to see actual passwords</li>
                <li>• Users are stored in localStorage - clear browser data to reset</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
