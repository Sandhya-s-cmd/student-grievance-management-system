import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const MediationManagement = ({ user }) => {
  const navigate = useNavigate();
  const [mediations, setMediations] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedMediation, setSelectedMediation] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  
  // Form data for scheduling
  const [formData, setFormData] = useState({
    title: '',
    complaintId: '',
    studentId: '',
    authorityId: '',
    date: '',
    time: '',
    location: '',
    type: 'virtual',
    description: '',
    priority: 'medium'
  });

  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [authorities, setAuthorities] = useState([]);

  useEffect(() => {
    loadMediationData();
  }, []);

  const loadMediationData = () => {
    // Load existing mediations
    const existingMediations = JSON.parse(localStorage.getItem('mediations') || '[]');
    setMediations(existingMediations);

    // Load complaints that might need mediation
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const mediationCandidates = allComplaints.filter(c => 
      c.status === 'pending' || c.status === 'in_progress' || c.requiresMediation
    );
    setComplaints(mediationCandidates);

    // Load users
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const studentUsers = allUsers.filter(u => u.role === 'student');
    const authorityUsers = allUsers.filter(u => u.role === 'admin');
    
    setStudents(studentUsers);
    setAuthorities(authorityUsers);
  };

  // Generate meeting link for virtual sessions
  const generateMeetingLink = (mediation) => {
    if (mediation.type === 'virtual') {
      // Generate a mock meeting link (in real app, this would integrate with Zoom/Teams)
      const meetingId = `MED-${Date.now()}`;
      const platforms = ['zoom', 'teams', 'meet'];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      
      switch(platform) {
        case 'zoom':
          return `https://zoom.us/j/${meetingId}`;
        case 'teams':
          return `https://teams.microsoft.com/l/meetup-join/${meetingId}`;
        case 'meet':
          return `https://meet.google.com/${meetingId}`;
        default:
          return mediation.location || 'No link provided';
      }
    }
    return mediation.location || 'Physical location';
  };

  // Send notification to participant
  const sendNotification = (participant, mediation, notificationType) => {
    // Get existing notifications or create new array
    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    const notification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: participant.id,
      type: notificationType,
      title: notificationType === 'mediation_scheduled' ? 'Mediation Session Scheduled' : 'Mediation Session Updated',
      message: `
        You have been invited to a mediation session:
        Title: ${mediation.title}
        Date: ${new Date(mediation.date).toLocaleDateString()}
        Time: ${mediation.time}
        Type: ${mediation.type === 'virtual' ? 'Virtual' : 'In-Person'}
        ${mediation.type === 'virtual' ? `Meeting Link: ${generateMeetingLink(mediation)}` : `Location: ${mediation.location || 'TBD'}`}
        Priority: ${mediation.priority}
      `,
      mediationId: mediation.id,
      complaintId: mediation.complaintId,
      status: 'unread',
      createdAt: new Date().toISOString(),
      readAt: null
    };
    
    existingNotifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(existingNotifications));
    
    // Also add to user's personal notification list
    const userNotifications = JSON.parse(localStorage.getItem(`notifications_${participant.id}`) || '[]');
    userNotifications.push(notification);
    localStorage.setItem(`notifications_${participant.id}`, JSON.stringify(userNotifications));
    
    console.log(`Notification sent to ${participant.name || participant.email}:`, notification);
    return notification;
  };

  // Send email notification (simulated)
  const sendEmailNotification = (participant, mediation) => {
    // In a real application, this would call an email service API
    const emailData = {
      to: participant.email,
      subject: `Mediation Session Scheduled: ${mediation.title}`,
      body: `
        Dear ${participant.name || participant.email},
        
        You have been scheduled for a mediation session:
        
        Title: ${mediation.title}
        Date: ${new Date(mediation.date).toLocaleDateString()}
        Time: ${mediation.time}
        Type: ${mediation.type === 'virtual' ? 'Virtual' : 'In-Person'}
        ${mediation.type === 'virtual' ? `Meeting Link: ${generateMeetingLink(mediation)}` : `Location: ${mediation.location || 'TBD'}`}
        Priority: ${mediation.priority}
        
        ${mediation.description ? `Description: ${mediation.description}` : ''}
        
        Please be available at the scheduled time.
        
        Best regards,
        ${user.name || user.email}
        Grievance Portal
      `,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    
    // Store sent emails for tracking
    const sentEmails = JSON.parse(localStorage.getItem('sent_emails') || '[]');
    sentEmails.push(emailData);
    localStorage.setItem('sent_emails', JSON.stringify(sentEmails));
    
    console.log(`Email sent to ${participant.email}:`, emailData);
    return emailData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    // Validation
    if (!formData.title || !formData.complaintId || !formData.studentId || 
        !formData.authorityId || !formData.date || !formData.time) {
      setSubmitStatus('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate meeting link if virtual
      const meetingLink = formData.type === 'virtual' ? generateMeetingLink(formData) : formData.location;

      const newMediation = {
        id: `MED-${Date.now()}`,
        ...formData,
        location: meetingLink,
        status: 'scheduled',
        createdBy: user.name || user.email,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        participants: [
          { id: formData.studentId, type: 'student', status: 'invited' },
          { id: formData.authorityId, type: 'authority', status: 'invited' }
        ],
        notificationsSent: false
      };

      // Save to localStorage
      const existingMediations = JSON.parse(localStorage.getItem('mediations') || '[]');
      existingMediations.push(newMediation);
      localStorage.setItem('mediations', JSON.stringify(existingMediations));

      // Update complaint to mark as requiring mediation
      const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
      const updatedComplaints = allComplaints.map(c => {
        if (c.id === formData.complaintId) {
          return {
            ...c,
            requiresMediation: true,
            mediationId: newMediation.id,
            lastUpdated: new Date().toISOString(),
            updatedBy: user.name || user.email
          };
        }
        return c;
      });
      localStorage.setItem('complaints', JSON.stringify(updatedComplaints));

      // Get participant details
      const student = students.find(s => s.id === formData.studentId);
      const authority = authorities.find(a => a.id === formData.authorityId);
      
      // Send notifications to participants
      const notifications = [];
      
      if (student) {
        const studentNotification = sendNotification(student, newMediation, 'mediation_scheduled');
        const studentEmail = sendEmailNotification(student, newMediation);
        notifications.push({
          participant: 'student',
          notification: studentNotification,
          email: studentEmail
        });
      }
      
      if (authority) {
        const authorityNotification = sendNotification(authority, newMediation, 'mediation_scheduled');
        const authorityEmail = sendEmailNotification(authority, newMediation);
        notifications.push({
          participant: 'authority',
          notification: authorityNotification,
          email: authorityEmail
        });
      }

      // Update mediation to mark notifications as sent
      newMediation.notificationsSent = true;
      newMediation.participantNotifications = notifications;
      
      // Save updated mediation with notification status
      const updatedMediations = JSON.parse(localStorage.getItem('mediations') || '[]');
      const mediationIndex = updatedMediations.findIndex(m => m.id === newMediation.id);
      if (mediationIndex !== -1) {
        updatedMediations[mediationIndex] = newMediation;
        localStorage.setItem('mediations', JSON.stringify(updatedMediations));
      }

      setSubmitStatus('success');
      setIsSubmitting(false);
      
      // Show success message with notification details
      console.log('Mediation scheduled successfully with notifications:', {
        mediation: newMediation,
        notificationsSent: notifications,
        meetingLink: meetingLink
      });
      
      // Reset form and refresh data
      setTimeout(() => {
        setShowScheduleForm(false);
        setFormData({
          title: '',
          complaintId: '',
          studentId: '',
          authorityId: '',
          date: '',
          time: '',
          location: '',
          type: 'virtual',
          description: '',
          priority: 'medium'
        });
        loadMediationData();
      }, 3000);

    } catch (error) {
      console.error('Error scheduling mediation:', error);
      setSubmitStatus('error');
      setIsSubmitting(false);
    }
  };

  const updateMediationStatus = (mediationId, newStatus) => {
    const allMediations = JSON.parse(localStorage.getItem('mediations') || '[]');
    const updatedMediations = allMediations.map(m => {
      if (m.id === mediationId) {
        return {
          ...m,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
          updatedBy: user.name || user.email
        };
      }
      return m;
    });
    
    localStorage.setItem('mediations', JSON.stringify(updatedMediations));
    loadMediationData();
  };

  const deleteMediation = (mediationId) => {
    if (window.confirm('Are you sure you want to delete this mediation session?')) {
      const allMediations = JSON.parse(localStorage.getItem('mediations') || '[]');
      const updatedMediations = allMediations.filter(m => m.id !== mediationId);
      localStorage.setItem('mediations', JSON.stringify(updatedMediations));
      loadMediationData();
    }
  };

  const filteredMediations = mediations.filter(mediation => {
    const matchesStatus = filterStatus === 'all' || mediation.status === filterStatus;
    const matchesSearch = mediation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mediation.complaintId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'virtual' ? 
      <VideoCameraIcon className="h-4 w-4" /> : 
      <BuildingOfficeIcon className="h-4 w-4" />;
  };

  if (showScheduleForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-xl rounded-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Schedule New Mediation</h2>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mediation Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter mediation title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Complaint *
                  </label>
                  <select
                    value={formData.complaintId}
                    onChange={(e) => setFormData({...formData, complaintId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Complaint</option>
                    {complaints.map(complaint => (
                      <option key={complaint.id} value={complaint.id}>
                        {complaint.id} - {complaint.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name || student.email} - {student.studentId || 'No ID'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authority/Faculty *
                  </label>
                  <select
                    value={formData.authorityId}
                    onChange={(e) => setFormData({...formData, authorityId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Authority</option>
                    {authorities.map(authority => (
                      <option key={authority.id} value={authority.id}>
                        {authority.name || authority.email} - {authority.department || 'No Dept'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mediation Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="virtual">Virtual (Online)</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location / Meeting Link
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.type === 'virtual' ? 'Enter meeting link (Zoom, Teams, etc.)' : 'Enter physical location'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mediation details, agenda, or special requirements..."
                />
              </div>

              {submitStatus && (
                <div className={`p-4 rounded-lg ${
                  submitStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {submitStatus === 'success' ? (
                    <div>
                      <div className="font-semibold mb-2">✅ Mediation session scheduled successfully!</div>
                      <div className="text-sm space-y-1">
                        <div>📧 Email notifications sent to all participants</div>
                        <div>🔔 In-app notifications created</div>
                        <div>📅 Meeting link generated and shared</div>
                      </div>
                    </div>
                  ) : (
                    submitStatus
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Mediation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mediation Management</h1>
                <p className="text-gray-600 mt-1">Manage and track mediation sessions for dispute resolution</p>
              </div>
              <button
                onClick={() => setShowScheduleForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Schedule New Mediation
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{mediations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediations.filter(m => m.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediations.filter(m => m.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediations.filter(m => m.priority === 'high').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search mediations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mediations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Mediation Sessions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredMediations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No mediation sessions found</p>
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule First Mediation
                </button>
              </div>
            ) : (
              filteredMediations.map((mediation) => (
                <div key={mediation.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{mediation.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(mediation.status)}`}>
                          {mediation.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(mediation.priority)}`}>
                          {mediation.priority}
                        </span>
                        {mediation.notificationsSent && (
                          <div className="flex items-center space-x-1">
                            <BellIcon className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">Notified</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          {getTypeIcon(mediation.type)}
                          <span className="ml-1">{mediation.type === 'virtual' ? 'Virtual' : 'In-Person'}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(mediation.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {mediation.time}
                        </div>
                        {mediation.location && (
                          <div className="flex items-center">
                            {mediation.type === 'virtual' ? (
                              <VideoCameraIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <MapPinIcon className="h-4 w-4 mr-1" />
                            )}
                            {mediation.location}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          Complaint: {mediation.complaintId}
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          Created by: {mediation.createdBy}
                        </div>
                      </div>

                      {mediation.description && (
                        <p className="text-sm text-gray-600 mb-2">{mediation.description}</p>
                      )}

                      <div className="flex items-center space-x-2">
                        {mediation.status === 'scheduled' && (
                          <button
                            onClick={() => updateMediationStatus(mediation.id, 'in-progress')}
                            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                          >
                            Start Session
                          </button>
                        )}
                        {mediation.status === 'in-progress' && (
                          <button
                            onClick={() => updateMediationStatus(mediation.id, 'completed')}
                            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {(mediation.status === 'scheduled' || mediation.status === 'in-progress') && (
                          <button
                            onClick={() => updateMediationStatus(mediation.id, 'cancelled')}
                            className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedMediation(mediation)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedMediation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Mediation Details</h3>
                <button
                  onClick={() => setSelectedMediation(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedMediation.title}</h4>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMediation.status)}`}>
                    {selectedMediation.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedMediation.priority)}`}>
                    {selectedMediation.priority}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium">
                    {new Date(selectedMediation.date).toLocaleDateString()} at {selectedMediation.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium flex items-center">
                    {getTypeIcon(selectedMediation.type)}
                    <span className="ml-1">{selectedMediation.type === 'virtual' ? 'Virtual' : 'In-Person'}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{selectedMediation.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Complaint ID</p>
                  <p className="font-medium">{selectedMediation.complaintId}</p>
                </div>
              </div>

              {selectedMediation.description && (
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{selectedMediation.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">
                  {new Date(selectedMediation.createdAt).toLocaleString()} by {selectedMediation.createdBy}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedMediation(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedMediation.status === 'scheduled' && (
                  <button
                    onClick={() => {
                      updateMediationStatus(selectedMediation.id, 'in-progress');
                      setSelectedMediation(null);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Start Session
                  </button>
                )}
                {selectedMediation.status === 'in-progress' && (
                  <button
                    onClick={() => {
                      updateMediationStatus(selectedMediation.id, 'completed');
                      setSelectedMediation(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Complete Session
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediationManagement;
