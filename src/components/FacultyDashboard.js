import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AuthorityDashboard = ({ user }) => {
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

  // Load faculty data and complaints
  useEffect(() => {
    loadComplaintData();
  }, [user]);

  const loadComplaintData = () => {
    // Clear any existing data first
    setComplaints([]);
    setStats({
      totalComplaints: 0,
      pendingComplaints: 0,
      inProgressComplaints: 0,
      resolvedComplaints: 0,
      avgResolutionTime: 0
    });
    setChartData([]);
    setCategoryData([]);
    
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    console.log('Faculty Dashboard - All complaints:', allComplaints);
    console.log('Faculty Dashboard - Current user:', user);
    
    // Filter complaints assigned to this authority
    const authorityComplaints = allComplaints.filter(c => {
      // Only show complaints that are assigned to this authority
      // Check if complaint is assigned to this authority by email
      if (c.assignedToEmail && user.email && c.assignedToEmail === user.email) {
        console.log('Match found by assignedToEmail:', c.assignedToEmail);
        return true;
      }
      // Check if complaint is assigned to this authority by name
      if (c.assignedTo && user.name && c.assignedTo === user.name) {
        console.log('Match found by assignedTo:', c.assignedTo);
        return true;
      }
      // Check by combined firstName/lastName
      if (user.firstName && user.lastName && c.assignedTo) {
        const fullName = `${user.firstName} ${user.lastName}`;
        if (c.assignedTo === fullName) {
          console.log('Match found by fullName:', fullName);
          return true;
        }
      }
      return false;
    });
    
    console.log('Faculty Dashboard - Authority complaints (filtered):', authorityComplaints);
    console.log('Faculty Dashboard - Authority complaints count:', authorityComplaints.length);

    setComplaints(authorityComplaints);

    // Calculate stats
    const total = authorityComplaints.length;
    const pending = authorityComplaints.filter(c => c.status === 'assigned').length;
    const inProgress = authorityComplaints.filter(c => c.status === 'in_progress').length;
    const resolved = authorityComplaints.filter(c => c.status === 'resolved').length;

    setStats({
      totalComplaints: total,
      pendingComplaints: pending,
      inProgressComplaints: inProgress,
      resolvedComplaints: resolved,
      avgResolutionTime: '2.5'
    });

    // Prepare chart data (monthly trends)
    const monthlyData = [];
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    
    months.forEach(month => {
      const monthComplaints = authorityComplaints.filter(c => {
        const complaintMonth = new Date(c.createdAt || c.date).toLocaleString('default', { month: 'short' });
        return complaintMonth === month;
      });
      monthlyData.push({
        month,
        complaints: monthComplaints.length
      });
    });

    setChartData(monthlyData);

    // Prepare category data
    const categories = {};
    authorityComplaints.forEach(complaint => {
      categories[complaint.category] = (categories[complaint.category] || 0) + 1;
    });
    
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    
    const categoryChartData = Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));

    setCategoryData(categoryChartData);
  };

  const updateComplaintStatus = (complaintId, newStatus) => {
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const updatedComplaints = allComplaints.map(complaint => {
      if (complaint.id === complaintId) {
        const updatedComplaint = {
          ...complaint,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
          updatedBy: user.name || user.email,
          updatedAt: new Date().toISOString()
        };
        
        // Update progress based on status
        if (newStatus === 'resolved') {
          updatedComplaint.progress = 100;
          updatedComplaint.resolvedAt = new Date().toISOString();
        } else if (newStatus === 'in-progress') {
          updatedComplaint.progress = 50;
        } else if (newStatus === 'pending') {
          updatedComplaint.progress = 0;
        }
        
        return updatedComplaint;
      }
      return complaint;
    });
    
    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    loadComplaintData(); // Refresh dashboard data
    
    // Show success message
    const message = `Complaint ${complaintId} status updated to ${newStatus}`;
    console.log(message);
  };

  const refreshDashboard = () => {
    console.log('Authority Dashboard - Refreshing data...');
    try {
      loadComplaintData();
      console.log('Authority Dashboard - Data refreshed successfully');
    } catch (error) {
      console.error('Authority Dashboard - Error refreshing dashboard:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
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
              <h1 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'>Authority Dashboard</h1>
              <p className='text-gray-600 mt-1'>Welcome back, {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Authority Member'}!</p>
            </div>
            
            <div className='flex items-center space-x-3'>
              <button
                onClick={refreshDashboard}
                className='px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 text-sm transition-all duration-200 transform hover:scale-105 shadow-md'
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
            className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 transform transition-all duration-200 hover:scale-105 hover:shadow-xl'
            onMouseEnter={() => setHoveredCard('total')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Complaints</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.totalComplaints}</p>
              </div>
              <div className={`p-3 rounded-lg transition-all duration-300 ${hoveredCard === 'total' ? 'bg-purple-100 scale-110' : 'bg-purple-50'}`}>
                <DocumentTextIcon className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </div>

          <div 
            className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 transform transition-all duration-200 hover:scale-105 hover:shadow-xl'
            onMouseEnter={() => setHoveredCard('pending')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Pending</p>
                <p className='text-2xl font-bold text-yellow-600'>{stats.pendingComplaints}</p>
              </div>
              <div className={`p-3 rounded-lg transition-all duration-300 ${hoveredCard === 'pending' ? 'bg-yellow-100 scale-110' : 'bg-yellow-50'}`}>
                <ClockIcon className='h-6 w-6 text-yellow-600' />
              </div>
            </div>
          </div>

          <div 
            className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 transform transition-all duration-200 hover:scale-105 hover:shadow-xl'
            onMouseEnter={() => setHoveredCard('inProgress')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>In Progress</p>
                <p className='text-2xl font-bold text-blue-600'>{stats.inProgressComplaints}</p>
              </div>
              <div className={`p-3 rounded-lg transition-all duration-300 ${hoveredCard === 'inProgress' ? 'bg-blue-100 scale-110' : 'bg-blue-50'}`}>
                <FunnelIcon className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </div>

          <div 
            className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 transform transition-all duration-200 hover:scale-105 hover:shadow-xl'
            onMouseEnter={() => setHoveredCard('resolved')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Resolved</p>
                <p className='text-2xl font-bold text-green-600'>{stats.resolvedComplaints}</p>
              </div>
              <div className={`p-3 rounded-lg transition-all duration-300 ${hoveredCard === 'resolved' ? 'bg-green-100 scale-110' : 'bg-green-50'}`}>
                <CheckCircleIcon className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Monthly Trends Chart */}
          <div className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20'>
            <h3 className='text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6'>Monthly Complaint Trends</h3>
            <ResponsiveContainer width='100%' height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' />
                <XAxis dataKey='month' stroke='#666' />
                <YAxis stroke='#666' />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line 
                  type='monotone' 
                  dataKey='complaints' 
                  stroke='#8B5CF6' 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className='text-sm text-gray-500 mt-4 text-center'>Showing trends for the last 6 months</p>
          </div>

          {/* Category Distribution */}
          <div className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20'>
            <h3 className='text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6'>Complaint Categories</h3>
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
          <h3 className='text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6'>Quick Actions</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <button
              onClick={() => navigate('/complaints')}
              className='group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl'
            >
              <ChartBarIcon className='h-5 w-5 mr-2 group-hover:rotate-12 transition-transform' />
              View All Complaints
            </button>
            
            <button
              onClick={() => navigate('/submit-complaint')}
              className='group flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-purple-300 hover:bg-purple-50 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg'
            >
              <DocumentTextIcon className='h-5 w-5 mr-2 group-hover:text-purple-600 transition-colors' />
              Submit New Complaint
            </button>
          </div>
        </div>

        {/* Enhanced Recent Complaints */}
        <div className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20'>
          <div className='flex justify-between items-center mb-6'>
            <h3 className='text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'>Recent Complaints</h3>
            <button
              onClick={() => navigate('/complaints')}
              className='text-purple-600 hover:text-purple-500 text-sm font-medium hover:underline transition-colors'
            >
              View All
            </button>
          </div>
          
          {recentComplaints.length === 0 ? (
            <div className='text-center py-12'>
              <ExclamationTriangleIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500 text-lg font-medium mb-2'>No complaints assigned to you</p>
              <p className='text-gray-400 text-sm'>Complaints assigned to you by admin will appear here</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {recentComplaints.map((complaint, index) => (
                <div key={index} className='bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-200'>
                  <div className='flex justify-between items-start mb-2'>
                    <h4 className='font-semibold text-gray-900 flex-1 mr-4'>{complaint.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  <p className='text-gray-600 text-sm mb-3 line-clamp-2'>{complaint.description}</p>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4 text-xs text-gray-500'>
                      <span className={`px-2 py-1 rounded ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                      <span className='flex items-center'>
                        <CalendarIcon className='h-3 w-3 mr-1' />
                        {new Date(complaint.createdAt || complaint.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className='flex gap-2'>
                      {complaint.status === 'assigned' && (
                        <button
                          onClick={() => updateComplaintStatus(complaint.id, 'in-progress')}
                          className='flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors border border-blue-200'
                          title='Start Working on Complaint'
                        >
                          <ExclamationTriangleIcon className='h-3 w-3 mr-1' />
                          Start
                        </button>
                      )}
                      {complaint.status === 'in_progress' && (
                        <button
                          onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                          className='flex items-center px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors border border-green-200'
                          title='Mark as Resolved'
                        >
                          <CheckCircleIcon className='h-3 w-3 mr-1' />
                          Resolve
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/complaints/${complaint.id}`)}
                        className='text-purple-600 hover:text-purple-500 text-sm font-medium hover:underline transition-colors'
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

export default AuthorityDashboard;
