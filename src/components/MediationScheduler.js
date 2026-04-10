import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const MediationScheduler = ({ user, complaintId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    complaintId: complaintId || '',
    studentId: '',
    authorityId: '',
    date: '',
    time: '',
    location: '',
    type: 'virtual',
    description: ''
  });
  
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadMediationData();
  }, []);

  const loadMediationData = () => {
    // Load complaints
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const pendingComplaints = allComplaints.filter(c => 
      c.status === 'pending' || c.status === 'in_progress'
    );
    setComplaints(pendingComplaints);

    // Load users
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const studentUsers = allUsers.filter(u => u.role === 'student');
    const authorityUsers = allUsers.filter(u => u.role === 'admin');
    
    setStudents(studentUsers);
    setAuthorities(authorityUsers);

    // Pre-fill complaint ID if provided
    if (complaintId) {
      setFormData(prev => ({ ...prev, complaintId }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('User:', user);
    
    setIsSubmitting(true);
    setSubmitStatus('');

    // Validate form
    if (!formData.title || !formData.complaintId || !formData.studentId || 
        !formData.authorityId || !formData.date || !formData.time) {
      console.log('Validation failed - missing fields');
      console.log('Missing fields:', {
        title: !formData.title,
        complaintId: !formData.complaintId,
        studentId: !formData.studentId,
        authorityId: !formData.authorityId,
        date: !formData.date,
        time: !formData.time
      });
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    console.log('Validation passed, proceeding with submission');
    
    try {
      // Create mediation session
      const mediationSession = {
        id: 'M' + Date.now().toString().slice(-6),
        ...formData,
        createdBy: user.id || user.email || 'admin',
        createdAt: new Date().toISOString(),
        status: 'scheduled',
        attendees: [formData.studentId, formData.authorityId],
        meetingLink: formData.type === 'virtual' ? generateMeetingLink() : null
      };
      
      console.log('Created mediation session:', mediationSession);

      // Save to localStorage
      const existingSessions = JSON.parse(localStorage.getItem('mediationSessions') || '[]');
      existingSessions.push(mediationSession);
      localStorage.setItem('mediationSessions', JSON.stringify(existingSessions));
      console.log('Saved to localStorage');

      // Update complaint status
      const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
      const updatedComplaints = allComplaints.map(c => 
        c.id === formData.complaintId 
          ? { ...c, status: 'mediation_scheduled', mediationSessionId: mediationSession.id }
          : c
      );
      localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
      console.log('Updated complaint status');

      // Create notification for student
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push({
        id: 'N' + Date.now().toString().slice(-6),
        userId: formData.studentId,
        userEmail: students.find(s => s.id === formData.studentId)?.email,
        title: 'Mediation Session Scheduled',
        message: `A mediation session has been scheduled for your complaint (${formData.complaintId}) on ${formData.date} at ${formData.time}`,
        type: 'mediation_scheduled',
        complaintId: formData.complaintId,
        createdAt: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('notifications', JSON.stringify(notifications));

      // Create notification for authority
      notifications.push({
        id: 'N' + (Date.now() + 1).toString().slice(-6),
        userId: formData.authorityId,
        userEmail: authorities.find(a => a.id === formData.authorityId)?.email,
        title: 'Mediation Session Assigned',
        message: `You have been assigned to a mediation session on ${formData.date} at ${formData.time}`,
        type: 'mediation_assigned',
        complaintId: formData.complaintId,
        createdAt: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('notifications', JSON.stringify(notifications));
      console.log('Created notifications');

      setSubmitStatus('success');
      setShowSuccess(true);
      console.log('Submission successful, showing success screen');
      
      // Reset form
      setFormData({
        title: '',
        complaintId: complaintId || '',
        studentId: '',
        authorityId: '',
        date: '',
        time: '',
        location: '',
        type: 'virtual',
        description: ''
      });

    } catch (error) {
      console.error('Error scheduling mediation:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      console.log('Form submission process completed');
    }
  };

  const generateMeetingLink = () => {
    return `https://meet.university.edu/mediation/${Date.now().toString().slice(-6)}`;
  };

  const getComplaintDetails = (complaintId) => {
    const complaint = complaints.find(c => c.id === complaintId);
    return complaint ? `${complaint.title} - ${complaint.category}` : '';
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : '';
  };

  const getAuthorityName = (authorityId) => {
    const authority = authorities.find(a => a.id === authorityId);
    return authority ? `${authority.firstName} ${authority.lastName}` : '';
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Mediation Session Scheduled!</h3>
            <p className="text-gray-600 mb-6">
              The mediation session has been successfully scheduled and notifications have been sent to all participants.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setFormData({
                    title: '',
                    complaintId: complaintId || '',
                    studentId: '',
                    authorityId: '',
                    date: '',
                    time: '',
                    location: '',
                    type: 'virtual',
                    description: ''
                  });
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Schedule Another Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Schedule New Mediation Session</h2>
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter mediation session title"
                required
              />
            </div>

            {/* Complaint ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complaint ID
              </label>
              <select
                name="complaintId"
                value={formData.complaintId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a complaint</option>
                {complaints.map(complaint => (
                  <option key={complaint.id} value={complaint.id}>
                    {complaint.id} - {complaint.title}
                  </option>
                ))}
              </select>
              {formData.complaintId && (
                <p className="mt-1 text-sm text-gray-500">
                  {getComplaintDetails(formData.complaintId)}
                </p>
              )}
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.id} - {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
              {formData.studentId && (
                <p className="mt-1 text-sm text-gray-500">
                  {getStudentName(formData.studentId)}
                </p>
              )}
            </div>

            {/* Authority ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authority ID
              </label>
              <select
                name="authorityId"
                value={formData.authorityId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select an authority</option>
                {authorities.map(authority => (
                  <option key={authority.id} value={authority.id}>
                    {authority.id} - {authority.firstName} {authority.lastName} ({authority.role})
                  </option>
                ))}
              </select>
              {formData.authorityId && (
                <p className="mt-1 text-sm text-gray-500">
                  {getAuthorityName(formData.authorityId)}
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Meeting room or location"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="virtual"
                    checked={formData.type === 'virtual'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Virtual
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="in-person"
                    checked={formData.type === 'in-person'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  In-Person
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mediation session details and agenda"
              />
            </div>

            {/* Status Messages */}
            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">
                  Please fill in all required fields.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MediationScheduler;
