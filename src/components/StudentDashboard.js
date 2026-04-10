import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  MicrophoneIcon,
  ChartBarIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import VoiceComplaintInput from './VoiceComplaintInput';

const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    avgResolutionTime: 0
  });
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const loadComplaintData = useCallback(() => {
    // Clear any existing data first
    setComplaints([]);
    setStats({
      totalComplaints: 0,
      pendingComplaints: 0,
      inProgressComplaints: 0,
      resolvedComplaints: 0,
      avgResolutionTime: '0.0'
    });
    setChartData([]);
    setCategoryData([]);

    // Load complaints from localStorage
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    console.log('Student Dashboard - All complaints:', allComplaints);
    
    // Filter complaints for current student
    const userComplaints = allComplaints.filter(complaint => {
      // Match by studentId first
      if (user.studentId && complaint.studentId === user.studentId) {
        return true;
      }
      // Fallback to email matching
      if (complaint.email && user.email && complaint.email === user.email) {
        return true;
      }
      return false;
    });
    
    console.log('Student Dashboard - User complaints:', userComplaints);
    setComplaints(userComplaints);

    // Calculate statistics
    const total = userComplaints.length;
    const pending = userComplaints.filter(c => c.status === 'pending').length;
    const inProgress = userComplaints.filter(c => c.status === 'in-progress').length;
    const resolved = userComplaints.filter(c => c.status === 'resolved').length;
    
    // Calculate average resolution time
    const resolvedComplaints = userComplaints.filter(c => c.status === 'resolved' && c.resolvedAt);
    const avgTime = resolvedComplaints.length > 0 
      ? resolvedComplaints.reduce((acc, c) => {
          const days = Math.ceil((new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24));
          return acc + days;
        }, 0) / resolvedComplaints.length
      : 0;
    
    const realStats = {
      totalComplaints: total,
      pendingComplaints: pending,
      inProgressComplaints: inProgress,
      resolvedComplaints: resolved,
      avgResolutionTime: avgTime.toFixed(1)
    };
    
    console.log('Student Dashboard - Real stats:', realStats);
    setStats(realStats);
    
    // Prepare chart data ONLY from user complaints
    const monthlyData = generateMonthlyData(userComplaints);
    console.log('Student Dashboard - Chart data:', monthlyData);
    setChartData(monthlyData);
    
    // Prepare category data ONLY from user complaints
    const categoryStats = generateCategoryData(userComplaints);
    console.log('Student Dashboard - Category data:', categoryStats);
    setCategoryData(categoryStats);
  }, [user]);

  // Load user data and complaints
  useEffect(() => {
    loadComplaintData();
  }, [loadComplaintData]);

  const generateMonthlyData = (complaints) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Show only the last 6 months including current month
    const recentMonths = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = monthIndex > currentMonth ? currentYear - 1 : currentYear;
      
      const monthComplaints = complaints.filter(c => {
        const complaintDate = new Date(c.createdAt || c.date);
        return complaintDate.getMonth() === monthIndex && complaintDate.getFullYear() === year;
      });
      
      recentMonths.push({
        month: months[monthIndex],
        complaints: monthComplaints.length,
        fullMonth: `${months[monthIndex]} ${year}`
      });
    }
    
    console.log('Dashboard - Generated monthly data:', recentMonths);
    return recentMonths;
  };

  const generateCategoryData = (complaints) => {
    const categories = {};
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    complaints.forEach(complaint => {
      categories[complaint.category] = (categories[complaint.category] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshDashboard = () => {
    console.log('Refresh button clicked!');
    try {
      loadComplaintData();
      console.log('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    }
  };

  const recentComplaints = complaints
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 5);

  return (
    <div className="w-full">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-white/20'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>Student Dashboard</h1>
              <p className='text-gray-600 mt-1'>Welcome back, {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Student'}!</p>
            </div>
            
            <div className='flex items-center space-x-3'>
              <button
                onClick={refreshDashboard}
                className='px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 text-sm transition-all duration-200 transform hover:scale-105 shadow-md'
                title='Refresh dashboard data'
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div 
            className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer'
            onMouseEnter={() => setHoveredCard('total')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className='flex items-center'>
              <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 ${hoveredCard === 'total' ? 'animate-pulse' : ''}`}>
                <DocumentTextIcon className='h-6 w-6 text-white' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>Total Complaints</dt>
                  <dd className='text-2xl font-bold text-gray-900'>{stats.totalComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div 
            className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer'
            onMouseEnter={() => setHoveredCard('pending')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className='flex items-center'>
              <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 ${hoveredCard === 'pending' ? 'animate-pulse' : ''}`}>
                <ClockIcon className='h-6 w-6 text-white' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>Pending</dt>
                  <dd className='text-2xl font-bold text-gray-900'>{stats.pendingComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div 
            className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer'
            onMouseEnter={() => setHoveredCard('progress')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className='flex items-center'>
              <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 ${hoveredCard === 'progress' ? 'animate-pulse' : ''}`}>
                <ArrowTrendingUpIcon className='h-6 w-6 text-white' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>In Progress</dt>
                  <dd className='text-2xl font-bold text-gray-900'>{stats.inProgressComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div 
            className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer'
            onMouseEnter={() => setHoveredCard('resolved')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className='flex items-center'>
              <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 ${hoveredCard === 'resolved' ? 'animate-pulse' : ''}`}>
                <CheckCircleIcon className='h-6 w-6 text-white' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>Resolved</dt>
                  <dd className='text-2xl font-bold text-gray-900'>{stats.resolvedComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Monthly Trends */}
          <div className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20'>
            <h3 className='text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4'>Monthly Complaint Trends</h3>
            <ResponsiveContainer width='100%' height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis 
                  dataKey='month' 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  stroke='#6b7280'
                />
                <YAxis stroke='#6b7280' />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
                          <p className='text-sm font-medium text-gray-900'>{payload[0].payload.month}</p>
                          <p className='text-sm text-blue-600 font-semibold'>{payload[0].value} complaints</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type='monotone' 
                  dataKey='complaints' 
                  stroke='url(#colorGradient)' 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
            {chartData.length > 0 && (
              <div className='mt-4 text-center text-sm text-gray-500 bg-blue-50 rounded-lg p-2'>
                Showing trends for the last 6 months
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20'>
            <h3 className='text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4'>Complaint Categories</h3>
            <ResponsiveContainer width='100%' height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/20'>
          <h3 className='text-lg font-semibold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-6'>Quick Actions</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <button
              onClick={() => navigate('/submit-complaint')}
              className='group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl'
            >
              <DocumentTextIcon className='h-5 w-5 mr-2 group-hover:rotate-12 transition-transform' />
              Submit New Complaint
            </button>
            
            <button
              onClick={() => navigate('/complaints')}
              className='group flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-300 hover:bg-blue-50 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg'
            >
              <ChartBarIcon className='h-5 w-5 mr-2 group-hover:text-blue-600 transition-colors' />
              View All Complaints
            </button>
          </div>
        </div>

        {/* Enhanced Recent Complaints */}
        <div className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>Recent Complaints</h3>
            <button
              onClick={() => navigate('/complaints')}
              className='text-sm text-blue-600 hover:text-blue-500 font-medium hover:underline transition-colors'
            >
              View All
            </button>
          </div>
          
          {recentComplaints.length === 0 ? (
            <div className='text-center py-12'>
              <div className='mx-auto h-16 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4'>
                <DocumentTextIcon className='h-8 w-8 text-gray-400' />
              </div>
              <p className='text-gray-500 text-lg mb-2'>No complaints submitted yet</p>
              <p className='text-gray-400 text-sm mb-6'>Start by submitting your first complaint</p>
              <button
                onClick={() => navigate('/submit-complaint')}
                className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl'
              >
                Submit Your First Complaint
              </button>
            </div>
          ) : (
            <div className='space-y-4'>
              {recentComplaints.map((complaint, index) => (
                <div 
                  key={complaint.id} 
                  className='border-l-4 border-gradient-to-b from-blue-400 to-indigo-400 bg-gradient-to-r from-white to-blue-50/30 rounded-lg p-4 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md'
                  style={{ 
                    borderLeftColor: index === 0 ? '#3B82F6' : index === 1 ? '#8B5CF6' : index === 2 ? '#10B981' : '#F59E0B',
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-3 mb-2'>
                        <p className='text-base font-semibold text-gray-900'>{complaint.title}</p>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)} border border-current/20`}>
                          {complaint.priority}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{complaint.description}</p>
                      <div className='flex items-center space-x-6 text-xs text-gray-500'>
                        <span className='flex items-center bg-white/60 px-2 py-1 rounded-full'>
                          <TagIcon className='h-3 w-3 mr-1' />
                          {complaint.category}
                        </span>
                        <span className='flex items-center bg-white/60 px-2 py-1 rounded-full'>
                          <CalendarIcon className='h-3 w-3 mr-1' />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className='flex flex-col items-end space-y-3 ml-4'>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)} border border-current/20`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <button
                        onClick={() => navigate(`/complaints/${complaint.id}`)}
                        className='text-blue-600 hover:text-blue-500 text-sm font-medium hover:underline transition-colors'
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
