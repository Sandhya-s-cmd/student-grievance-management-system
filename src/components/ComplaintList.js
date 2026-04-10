import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const ComplaintList = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Function to update complaint status
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
    loadComplaints(); // Refresh the list
    
    // Show success message
    const message = `Complaint ${complaintId} status updated to ${newStatus}`;
    console.log(message);
  };

  // Function to load complaints from localStorage
  const loadComplaints = () => {
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    console.log('All complaints:', allComplaints);
    console.log('Current user:', user);
    
    let complaintsToShow;
    
    if (user.role === 'admin') {
      // Admin users can see all complaints
      complaintsToShow = allComplaints;
      console.log('Admin: Showing all complaints');
    } else if (user.role === 'authority') {
      // Authority users can see all complaints but cannot update
      complaintsToShow = allComplaints;
      console.log('Authority: Showing all complaints (read-only)');
    } else {
      // Students can only see their own complaints
      complaintsToShow = allComplaints.filter(c => {
        const matchesStudentId = c.studentId && user.studentId && c.studentId === user.studentId;
        const matchesEmail = c.email && user.email && c.email === user.email;
        return matchesStudentId || matchesEmail;
      });
      console.log('Student: Showing user complaints only');
    }
    
    console.log('Complaints to show:', complaintsToShow);
    setComplaints(complaintsToShow);
    setFilteredComplaints(complaintsToShow);
  };

  useEffect(() => {
    // Show success message if coming from form submission
    if (location.state?.message) {
      setTimeout(() => {
        // Clear the state message after showing it
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000);
    }

    // Load complaints from localStorage
    loadComplaints();
    
    // Add event listener for storage changes (in case other tabs modify data)
    const handleStorageChange = () => {
      loadComplaints();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, navigate, location]);

  useEffect(() => {
    let filtered = complaints;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === filterPriority);
    }

    setFilteredComplaints(filtered);
  }, [complaints, searchTerm, filterStatus, filterPriority]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return CheckCircleIcon;
      case 'in-progress': return ExclamationTriangleIcon;
      case 'pending': return ClockIcon;
      default: return DocumentTextIcon;
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 50) return 'bg-blue-500';
    if (progress > 0) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const refreshComplaints = () => {
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    console.log('Refreshing - All complaints:', allComplaints);
    console.log('Refreshing - Current user:', user);
    
    const userComplaints = allComplaints.filter(c => {
      const matchesStudentId = c.studentId && user.studentId && c.studentId === user.studentId;
      const matchesEmail = c.email && user.email && c.email === user.email;
      return matchesStudentId || matchesEmail;
    });
    
    console.log('Refreshing - User complaints:', userComplaints);
    setComplaints(userComplaints);
    setFilteredComplaints(userComplaints);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.role === 'student' ? 'My Complaints' : 'All Complaints'}
            </h1>
            <p className="text-gray-600">
              {user.role === 'student' ? 'Track and manage your grievances' : 'Manage and resolve student complaints'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshComplaints}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              title="Refresh complaints list"
            >
              Refresh
            </button>
            {user.role === 'student' && (
              <button
                onClick={() => navigate('/submit-complaint')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit New Complaint
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {location.state?.message && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">{location.state.message}</p>
            {location.state.complaintId && (
              <span className="ml-2 text-sm text-green-600">
                (ID: {location.state.complaintId})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow">
        {filteredComplaints.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredComplaints.map((complaint) => {
              const StatusIcon = getStatusIcon(complaint.status);
              return (
                <div key={complaint.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(complaint.status).split(' ')[0]}`} />
                        <h3 className="text-lg font-medium text-gray-900">{complaint.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                        {complaint.anonymous && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border-gray-200">
                            Anonymous
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          <span>{complaint.id}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{complaint.date}</span>
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          <span>{complaint.assignedTo}</span>
                        </div>
                        {complaint.attachments > 0 && (
                          <div className="flex items-center">
                            <span>{complaint.attachments} attachment(s)</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {complaint.status === 'in-progress' && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs text-gray-500">{complaint.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(complaint.progress)}`}
                              style={{ width: `${complaint.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => navigate(`/complaints/${complaint.id}`)}
                        className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      
                      {/* Status update buttons for admin only */}
                      {user.role === 'admin' && (
                        <div className="flex gap-1">
                          {complaint.status !== 'in-progress' && (
                            <button
                              onClick={() => updateComplaintStatus(complaint.id, 'in-progress')}
                              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                              title="Mark as In Progress"
                            >
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              In Progress
                            </button>
                          )}
                          {complaint.status !== 'resolved' && (
                            <button
                              onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                              className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                              title="Mark as Resolved"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Resolve
                            </button>
                          )}
                          {complaint.status !== 'pending' && (
                            <button
                              onClick={() => updateComplaintStatus(complaint.id, 'pending')}
                              className="flex items-center px-3 py-2 text-sm text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-md transition-colors"
                              title="Mark as Pending"
                            >
                              <ClockIcon className="h-4 w-4 mr-1" />
                              Pending
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search or filters'
                : 'You haven\'t submitted any complaints yet'}
            </p>
            {user.role === 'student' && !searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
              <button
                onClick={() => navigate('/submit-complaint')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Your First Complaint
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-900">{complaints.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-lg font-semibold text-gray-900">
                {complaints.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {complaints.filter(c => c.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-lg font-semibold text-gray-900">
                {complaints.filter(c => c.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintList;
