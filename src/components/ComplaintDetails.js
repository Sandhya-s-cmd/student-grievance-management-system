import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const ComplaintDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  // Function to update complaint status
  const updateComplaintStatus = (newStatus) => {
    if (!complaint) return;
    
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const updatedComplaints = allComplaints.map(c => {
      if (c.id === complaint.id) {
        const updatedComplaint = {
          ...c,
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
      return c;
    });
    
    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    
    // Update the local state
    const updatedComplaint = updatedComplaints.find(c => c.id === complaint.id);
    setComplaint(updatedComplaint);
    
    console.log(`Complaint ${complaint.id} status updated to ${newStatus}`);
  };

  useEffect(() => {
    const loadComplaint = () => {
      const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
      const foundComplaint = allComplaints.find(c => c.id === id);
      
      if (foundComplaint) {
        setComplaint(foundComplaint);
        // Load comments for this complaint
        const allComments = JSON.parse(localStorage.getItem('complaintComments') || '{}');
        setComments(allComments[id] || []);
      }
      
      setLoading(false);
    };

    loadComplaint();
  }, [id]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        author: user.name || user.email,
        authorEmail: user.email,
        timestamp: new Date().toISOString(),
        type: 'student'
      };

      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      
      // Save to localStorage
      const allComments = JSON.parse(localStorage.getItem('complaintComments') || '{}');
      allComments[id] = updatedComments;
      localStorage.setItem('complaintComments', JSON.stringify(allComments));
      
      setNewComment('');
      setShowCommentBox(false);
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Complaint Not Found</h3>
          <p className="text-gray-500 mb-4">The complaint you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/complaints')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Complaints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/complaints')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Complaint Details</h1>
          </div>
        </div>

        {/* Complaint Card */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{complaint.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="font-medium">ID: {complaint.id}</span>
                  <span>•</span>
                  <span>{formatDate(complaint.createdAt || complaint.date)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority?.charAt(0).toUpperCase() + complaint.priority?.slice(1)} Priority
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                  {complaint.status?.charAt(0).toUpperCase() + complaint.status?.slice(1).replace('-', ' ')}
                </span>
              </div>
              
              {/* Status update buttons for admin only */}
              {user.role === 'admin' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500">Update Status:</span>
                  {complaint.status !== 'in-progress' && (
                    <button
                      onClick={() => updateComplaintStatus('in-progress')}
                      className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors border border-blue-200"
                    >
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      In Progress
                    </button>
                  )}
                  {complaint.status !== 'resolved' && (
                    <button
                      onClick={() => updateComplaintStatus('resolved')}
                      className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors border border-green-200"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Resolve
                    </button>
                  )}
                  {complaint.status !== 'pending' && (
                    <button
                      onClick={() => updateComplaintStatus('pending')}
                      className="flex items-center px-3 py-1 text-sm text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-md transition-colors border border-yellow-200"
                    >
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Pending
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Complaint Information</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Category:</dt>
                    <dd className="text-sm text-gray-900">{complaint.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Submitted by:</dt>
                    <dd className="text-sm text-gray-900">{complaint.anonymous ? 'Anonymous' : (complaint.studentName || user.name)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Student ID:</dt>
                    <dd className="text-sm text-gray-900">{complaint.studentId || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Email:</dt>
                    <dd className="text-sm text-gray-900">{complaint.email || user.email}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status Information</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Assigned to:</dt>
                    <dd className="text-sm text-gray-900">{complaint.assignedTo || 'Not assigned yet'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Last Updated:</dt>
                    <dd className="text-sm text-gray-900">{formatDate(complaint.lastUpdated || complaint.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Progress:</dt>
                    <dd className="text-sm text-gray-900">{complaint.progress || 0}%</dd>
                  </div>
                  {complaint.resolvedAt && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Resolved on:</dt>
                      <dd className="text-sm text-gray-900">{formatDate(complaint.resolvedAt)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Attachments */}
            {complaint.attachments && complaint.attachments > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Attachments</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <PaperClipIcon className="h-4 w-4 mr-2" />
                  {complaint.attachments} file(s) attached
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {complaint.progress !== undefined && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Progress</h3>
                  <span className="text-sm text-gray-600">{complaint.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${complaint.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Comments & Updates</h3>
              <button
                onClick={() => setShowCommentBox(!showCommentBox)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Comment
              </button>
            </div>
          </div>

          {/* Comment Box */}
          {showCommentBox && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a comment or update..."
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowCommentBox(false);
                        setNewComment('');
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddComment}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="px-6 py-4">
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No comments yet. Be the first to add a comment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
