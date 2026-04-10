import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  UserIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StudentDistressSystem from './StudentDistressSystem';
import EscalationEngine from './EscalationEngine';

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    totalUsers: 0,
    avgResolutionTime: 0
  });

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = () => {
    setIsLoading(true);
    console.log('Admin Dashboard - Loading data...');
    
    // Load real complaints from localStorage
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    console.log('Admin Dashboard - All complaints:', allComplaints);
    
    // Filter complaints - show all complaints including assigned ones for admin visibility
    const adminComplaints = allComplaints;
    console.log('Admin Dashboard - Admin complaints (filtered):', adminComplaints);
    
    // Load all users from localStorage
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Admin Dashboard - All users:', allUsers);
    
    // Calculate real statistics
    const total = adminComplaints.length;
    const pending = adminComplaints.filter(c => c.status === 'pending' || c.status === 'submitted').length;
    const assigned = adminComplaints.filter(c => c.status === 'assigned').length;
    const inProgress = adminComplaints.filter(c => c.status === 'in_progress').length;
    const resolved = adminComplaints.filter(c => c.status === 'resolved').length;
    
    // Calculate average resolution time
    const resolvedComplaints = adminComplaints.filter(c => c.status === 'resolved' && c.resolvedAt);
    const avgTime = resolvedComplaints.length > 0 
      ? resolvedComplaints.reduce((acc, c) => {
          const days = Math.ceil((new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24));
          return acc + days;
        }, 0) / resolvedComplaints.length
      : 0;
    
    const realStats = {
      totalComplaints: total,
      pendingComplaints: pending,
      assignedComplaints: assigned,
      inProgressComplaints: inProgress,
      resolvedComplaints: resolved,
      totalUsers: allUsers.length,
      avgResolutionTime: avgTime.toFixed(1)
    };
    
    console.log('Admin Dashboard - Real stats:', realStats);
    setStats(realStats);
    
    // Set real complaints (sorted by date)
    const sortedComplaints = adminComplaints.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || b.date));
    console.log('Admin Dashboard - Sorted complaints:', sortedComplaints);
    setComplaints(sortedComplaints);
    
    // Generate real department data
    const departments = generateDepartmentData(adminComplaints);
    console.log('Admin Dashboard - Department data:', departments);
    setDepartments(departments);
    
    // Generate real chart data
    const monthlyData = generateMonthlyData(adminComplaints);
    console.log('Admin Dashboard - Chart data:', monthlyData);
    setChartData(monthlyData);
    
    // Generate real category data
    const categoryData = generateCategoryData(adminComplaints);
    console.log('Admin Dashboard - Category data:', categoryData);
    setCategoryData(categoryData);
    
    setIsLoading(false);
    console.log('Admin Dashboard - Data loading complete');
  };

  const generateMonthlyData = (complaints) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
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
        resolved: monthComplaints.filter(c => c.status === 'resolved').length,
        pending: monthComplaints.filter(c => c.status === 'pending').length
      });
    }
    
    return recentMonths;
  };

  const generateCategoryData = (complaints) => {
    const categories = {};
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];
    
    complaints.forEach(complaint => {
      categories[complaint.category] = (categories[complaint.category] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));
  };

  const generateDepartmentData = (complaints) => {
    const departments = {};
    
    complaints.forEach(complaint => {
      const dept = complaint.department || 'Unassigned';
      if (!departments[dept]) {
        departments[dept] = { pending: 0, inProgress: 0, resolved: 0, total: 0 };
      }
      departments[dept].total++;
      departments[dept][complaint.status === 'in_progress' ? 'inProgress' : complaint.status]++;
    });
    
    return Object.entries(departments).map(([name, data]) => ({
      name,
      ...data,
      resolutionRate: data.total > 0 ? ((data.resolved / data.total) * 100).toFixed(1) : 0
    }));
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
    loadAdminData(); // Refresh the dashboard data
    
    // Show success message
    const message = `Complaint ${complaintId} status updated to ${newStatus}`;
    console.log(message);
  };

  const handleAssignStaff = () => {
    const pendingComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'submitted');
    if (pendingComplaints.length === 0) {
      alert('No pending complaints to assign.');
      return;
    }
    
    // Get list of authorities from users
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const authorities = allUsers.filter(u => u.role === 'authority');
    
    if (authorities.length === 0) {
      alert('No authorities available for assignment. Please create authority accounts first.');
      return;
    }
    
    // Show assignment dialog
    const authorityOptions = authorities.map((auth, index) => 
      `${index + 1}. ${auth.name || auth.email} (${auth.department || 'General'})`
    ).join('\n');
    
    const selection = prompt(
      `Select authority for assignment:\n\n${authorityOptions}\n\nEnter authority number (1-${authorities.length}):`
    );
    
    if (!selection) return;
    
    const authorityIndex = parseInt(selection) - 1;
    if (authorityIndex < 0 || authorityIndex >= authorities.length) {
      alert('Invalid selection.');
      return;
    }
    
    const selectedAuthority = authorities[authorityIndex];
    
    // Assign pending complaints to selected authority
    const updatedComplaints = complaints.map(complaint => {
      if (complaint.status === 'pending' || complaint.status === 'submitted') {
        return {
          ...complaint,
          assignedTo: selectedAuthority.name || selectedAuthority.email,
          assignedToEmail: selectedAuthority.email,
          assignedToRole: 'authority',
          assignedAt: new Date().toISOString(),
          status: 'assigned',
          progress: 25,
          lastUpdated: new Date().toISOString(),
          updatedBy: user.name || user.email
        };
      }
      return complaint;
    });
    
    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    loadAdminData();
    alert(`Assigned ${pendingComplaints.length} pending complaints to ${selectedAuthority.name || selectedAuthority.email}.`);
  };

  const handleGenerateReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      generatedBy: user.name || user.email,
      statistics: stats,
      totalComplaints: complaints.length,
      complaintsByStatus: {
        pending: complaints.filter(c => c.status === 'pending').length,
        inProgress: complaints.filter(c => c.status === 'in-progress').length,
        resolved: complaints.filter(c => c.status === 'resolved').length
      },
      complaintsByCategory: categoryData,
      departmentPerformance: departments
    };
    
    // Create downloadable report
    const reportBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const reportUrl = URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = reportUrl;
    link.download = `complaint-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(reportUrl);
    
    alert('Report generated and downloaded successfully!');
  };

  const handleScheduleReview = () => {
    const inProgressComplaints = complaints.filter(c => c.status === 'in-progress');
    if (inProgressComplaints.length === 0) {
      alert('No complaints in progress to review.');
      return;
    }
    
    // Schedule review for next week
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + 7);
    
    const reviewSchedule = {
      scheduledAt: reviewDate.toISOString(),
      scheduledBy: user.name || user.email,
      complaintsToReview: inProgressComplaints.map(c => c.id),
      totalComplaints: inProgressComplaints.length
    };
    
    // Save review schedule
    localStorage.setItem('reviewSchedule', JSON.stringify(reviewSchedule));
    alert(`Scheduled review for ${reviewDate.toLocaleDateString()} - ${inProgressComplaints.length} complaints to review.`);
  };

  const handleBulkActions = () => {
    const action = prompt('Choose bulk action:\n1. Mark all pending as in-progress\n2. Mark all in-progress as resolved\n3. Clear resolved complaints\n\nEnter number (1-3):');
    
    if (!action) return;
    
    let updatedComplaints = [...complaints];
    let message = '';
    
    switch(action) {
      case '1':
        updatedComplaints = complaints.map(c => {
          if (c.status === 'pending') {
            return { ...c, status: 'in-progress', progress: 25, lastUpdated: new Date().toISOString(), updatedBy: user.name || user.email };
          }
          return c;
        });
        message = 'All pending complaints marked as in-progress.';
        break;
      case '2':
        updatedComplaints = complaints.map(c => {
          if (c.status === 'in-progress') {
            return { ...c, status: 'resolved', progress: 100, resolvedAt: new Date().toISOString(), lastUpdated: new Date().toISOString(), updatedBy: user.name || user.email };
          }
          return c;
        });
        message = 'All in-progress complaints marked as resolved.';
        break;
      case '3':
        const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
        if (window.confirm(`Are you sure you want to clear ${resolvedCount} resolved complaints?`)) {
          updatedComplaints = complaints.filter(c => c.status !== 'resolved');
          message = `Cleared ${resolvedCount} resolved complaints.`;
        } else {
          return;
        }
        break;
      default:
        alert('Invalid action selected.');
        return;
    }
    
    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    loadAdminData();
    alert(message);
  };

  useEffect(() => {
    if (user) {
      console.log('Admin Dashboard - User detected:', user);
      loadAdminData();
    } else {
      console.log('Admin Dashboard - No user detected');
    }
  }, [user]);


  const refreshAdminData = () => {
    loadAdminData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-gray-100 text-gray-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-gradient-to-r from-red-100 to-pink-100';
      case 'medium': return 'text-yellow-600 bg-gradient-to-r from-yellow-100 to-orange-100';
      case 'low': return 'text-green-600 bg-gradient-to-r from-green-100 to-teal-100';
      default: return 'text-gray-600 bg-gradient-to-r from-gray-100 to-slate-100';
    }
  };

  const statCards = [
    {
      name: 'Total Complaints',
      value: stats.totalComplaints,
      icon: DocumentTextIcon,
      color: 'bg-gradient-to-r from-purple-500 to-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Pending',
      value: stats.pendingComplaints,
      icon: ClockIcon,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      change: '-5%',
      changeType: 'decrease'
    },
    {
      name: 'Assigned',
      value: stats.assignedComplaints,
      icon: UserIcon,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'In Progress',
      value: stats.inProgressComplaints,
      icon: ExclamationTriangleIcon,
      color: 'bg-gradient-to-r from-blue-500 to-purple-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Resolved',
      value: stats.resolvedComplaints,
      icon: CheckCircleIcon,
      color: 'bg-gradient-to-r from-green-500 to-teal-500',
      change: '+15%',
      changeType: 'increase'
    },
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      change: '+18%',
      changeType: 'increase'
    },
    {
      name: 'Avg Resolution Time',
      value: `${stats.avgResolutionTime} days`,
      icon: ArrowTrendingUpIcon,
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      change: '-0.5 days',
      changeType: 'decrease'
    }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-900 to-blue-900 bg-clip-text text-transparent">Admin Dashboard</h1>
          <p className="text-gray-600">Manage and monitor grievance system performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/schedule-mediation')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 text-sm flex items-center transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Schedule Mediation
          </button>
          <button
            onClick={refreshAdminData}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg border border-gray-200"
            title="Refresh admin data"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 bg-white rounded-lg shadow-md p-2">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
            { id: 'mediation', name: 'Mediation', icon: UserGroupIcon },
            { id: 'distress', name: 'Student Welfare', icon: ExclamationCircleIcon },
            { id: 'escalation', name: 'Smart Escalation', icon: ArrowTrendingUpIcon },
            { id: 'evidence', name: 'Digital Evidence', icon: ShieldCheckIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center py-2 px-3 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 ${
                selectedTab === tab.id
                  ? 'border-purple-500 text-purple-600 bg-gradient-to-r from-purple-50 to-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-lg p-4 transform transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-2 rounded-lg ${stat.color} transform transition-all duration-300 hover:scale-110`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs font-medium text-gray-600">{stat.name}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className={`h-3 w-3 ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Monthly Trends</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="month">Last 6 Months</option>
              <option value="quarter">Last 4 Quarters</option>
              <option value="year">Last 2 Years</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="complaints" stroke="#8b5cf6" strokeWidth={2} name="Total" dot={{ fill: '#8b5cf6' }} />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" dot={{ fill: '#10b981' }} />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending" dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Performance and Recent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Department Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Department Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Department</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Pending</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">In Progress</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Resolved</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept.name} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-colors duration-200">
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{dept.name}</td>
                    <td className="px-3 py-2 text-sm text-yellow-600">{dept.pending}</td>
                    <td className="px-3 py-2 text-sm text-blue-600">{dept.inProgress}</td>
                    <td className="px-3 py-2 text-sm text-green-600">{dept.resolved}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 font-medium">{dept.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Complaints</h3>
            <button
              onClick={() => navigate('/complaints')}
              className="text-purple-600 hover:text-purple-500 text-sm font-medium hover:underline transition-colors"
            >
              View All Complaints
            </button>
          </div>
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{complaint.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{complaint.id}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{complaint.department}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{complaint.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Status:</p>
                    <p className="text-xs font-medium text-gray-900">{complaint.status}</p>
                    {complaint.assignedTo && (
                      <>
                        <p className="text-xs text-gray-500 mt-1">Assigned to:</p>
                        <p className="text-xs font-medium text-gray-900">{complaint.assignedTo}</p>
                      </>
                    )}
                    <div className="mt-2 flex gap-1">
                      {complaint.status !== 'in-progress' && (
                        <button
                          onClick={() => updateComplaintStatus(complaint.id, 'in-progress')}
                          className="flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors border border-blue-200"
                          title="Mark as In Progress"
                        >
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          In Progress
                        </button>
                      )}
                      {complaint.status !== 'resolved' && (
                        <button
                          onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                          className="flex items-center px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors border border-green-200"
                          title="Mark as Resolved"
                        >
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Resolve
                        </button>
                      )}
                      {complaint.status !== 'pending' && (
                        <button
                          onClick={() => updateComplaintStatus(complaint.id, 'pending')}
                          className="flex items-center px-2 py-1 text-xs text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors border border-yellow-200"
                          title="Mark as Pending"
                        >
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Pending
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {complaint.status === 'in-progress' && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs text-gray-500">{complaint.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${complaint.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={handleAssignStaff}
            className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <UserIcon className="h-5 w-5 mr-2" />
            Assign to Authority
          </button>
          <button 
            onClick={handleGenerateReport}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Generate Report
          </button>
          <button 
            onClick={handleScheduleReview}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Schedule Review
          </button>
          <button 
            onClick={handleBulkActions}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Bulk Actions
          </button>
        </div>
      </div>
        </div>
      )}

      {selectedTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">Comprehensive analysis of grievance system performance and trends.</p>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Monthly Complaint Trends</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="complaints" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Complaint Categories</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Department Performance</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map((dept, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.pending}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.inProgress}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.resolved}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dept.total > 0 ? ((dept.resolved / dept.total) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-2">Average Resolution Time</h4>
              <p className="text-2xl font-bold text-blue-600">{stats.avgResolutionTime} days</p>
              <p className="text-sm text-gray-500 mt-1">Average time to resolve complaints</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-2">Resolution Rate</h4>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalComplaints > 0 ? ((stats.resolvedComplaints / stats.totalComplaints) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Complaints successfully resolved</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-2">Active Complaints</h4>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingComplaints + stats.inProgressComplaints}</p>
              <p className="text-sm text-gray-500 mt-1">Pending and in-progress complaints</p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'mediation' && (
        <div className="space-y-6">
          {/* Mediation Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Mediation Management</h3>
                <p className="text-gray-600">Manage and track mediation sessions for dispute resolution.</p>
              </div>
              <button
                onClick={() => navigate('/schedule-mediation')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Schedule New Mediation
              </button>
            </div>
          </div>

          {/* Mediation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {JSON.parse(localStorage.getItem('mediationSessions') || '[]').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {JSON.parse(localStorage.getItem('mediationSessions') || '[]').filter(m => m.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {JSON.parse(localStorage.getItem('mediationSessions') || '[]').filter(m => m.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Mediation Sessions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Recent Mediation Sessions</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {JSON.parse(localStorage.getItem('mediationSessions') || '[]')
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map((session) => (
                      <tr key={session.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.complaintId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === 'completed' ? 'bg-green-100 text-green-800' :
                            session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            session.type === 'virtual' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {session.type === 'virtual' ? 'Virtual' : 'In-Person'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {JSON.parse(localStorage.getItem('mediationSessions') || '[]').length === 0 && (
                <div className="text-center py-8">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500">No mediation sessions scheduled yet</p>
                  <button
                    onClick={() => navigate('/schedule-mediation')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Schedule First Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'distress' && (
        <StudentDistressSystem studentComplaints={complaints} onDistressAlert={(alert) => console.log('Distress alert:', alert)} />
      )}

      {selectedTab === 'escalation' && (
        <EscalationEngine complaints={complaints} departments={departments} onEscalation={(escalation) => console.log('Escalation:', escalation)} />
      )}

      {selectedTab === 'evidence' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Digital Evidence Management</h3>
          <p className="text-gray-600">Manage and verify digital evidence for all complaints.</p>
          <div className="mt-4 text-center py-8">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500">Evidence verification integrated with complaint forms</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
