import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    inProgressComplaints: 0
  });

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats = {
      totalComplaints: 156,
      pendingComplaints: 23,
      resolvedComplaints: 98,
      inProgressComplaints: 35
    };

    const mockRecentComplaints = [
      { id: 'G2024001', title: 'Library WiFi Issues', status: 'pending', priority: 'medium', date: '2024-02-23' },
      { id: 'G2024002', title: 'Hostel Water Supply', status: 'in-progress', priority: 'high', date: '2024-02-22' },
      { id: 'G2024003', title: 'Exam Schedule Conflict', status: 'resolved', priority: 'low', date: '2024-02-21' },
      { id: 'G2024004', title: 'Lab Equipment Malfunction', status: 'pending', priority: 'high', date: '2024-02-20' },
    ];

    const mockChartData = [
      { month: 'Jan', complaints: 45, resolved: 38 },
      { month: 'Feb', complaints: 52, resolved: 48 },
      { month: 'Mar', complaints: 38, resolved: 42 },
      { month: 'Apr', complaints: 61, resolved: 55 },
      { month: 'May', complaints: 48, resolved: 51 },
      { month: 'Jun', complaints: 55, resolved: 58 },
    ];

    setStats(mockStats);
    setRecentComplaints(mockRecentComplaints);
    setChartData(mockChartData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const statCards = [
    {
      name: 'Total Complaints',
      value: stats.totalComplaints,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Pending',
      value: stats.pendingComplaints,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      change: '-5%',
      changeType: 'decrease'
    },
    {
      name: 'In Progress',
      value: stats.inProgressComplaints,
      icon: ExclamationTriangleIcon,
      color: 'bg-blue-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Resolved',
      value: stats.resolvedComplaints,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      change: '+15%',
      changeType: 'increase'
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className={`h-4 w-4 ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change} from last month
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Complaint Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="complaints" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Complaints</h3>
            <div className="space-y-4">
              {recentComplaints.slice(0, 3).map((complaint) => (
                <div key={complaint.id} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                      <p className="text-sm text-gray-500">{complaint.category}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {user.role === 'student' && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/submit-complaint"
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Submit New Complaint
              </Link>
              <Link
                to="/complaints"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ClockIcon className="h-5 w-5 mr-2" />
                View All Complaints
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
