import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhotoIcon,
  XMarkIcon,
  MicrophoneIcon,
  PlusIcon,
  MinusIcon,
  PaperAirplaneIcon,
  InformationCircleIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import VoiceComplaintInput from './VoiceComplaintInput';
import DigitalEvidenceLayer from './DigitalEvidenceLayer';

const ComplaintForm = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    department: '',
    isAnonymous: false,
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [verifiedDocuments, setVerifiedDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    'Academic Issues',
    'Infrastructure',
    'Library Services',
    'Laboratory Equipment',
    'Examination',
    'Faculty Related',
    'Student Services',
    'Administrative',
    'Technical Support',
    'Campus Life',
    'Safety and Security',
    'Finance Related',
    'Career Services',
    'Health Services',
    'IT Services',
    'Transportation',
    'Sports and Recreation',
    'Environmental Issues',
    'Communication',
    'Chemistry Department',
    'Mathematics Department',
    'Library',
    'IT Department',
    'Examination Cell',
    'Accounts Department'
  ];

  const departments = [
    'Computer Science',
    'Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Physics Department',
    'Chemistry Department',
    'Mathematics Department',
    'Library',
    'IT Department',
    'Examination Cell',
    'Accounts Department'
  ];

  useEffect(() => {
    // AI-based categorization simulation
    if (formData.description.length > 50) {
      const timer = setTimeout(() => {
        const suggestions = analyzeComplaint(formData.description);
        setAiSuggestion(suggestions);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setAiSuggestion('');
    }
  }, [formData.description]);

  const analyzeComplaint = (description) => {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('wifi') || lowerDesc.includes('internet') || lowerDesc.includes('network')) {
      return 'Suggested Category: IT Services, Priority: High';
    } else if (lowerDesc.includes('water') || lowerDesc.includes('plumbing') || lowerDesc.includes('hostel')) {
      return 'Suggested Category: Hostel Facilities, Priority: Medium';
    } else if (lowerDesc.includes('exam') || lowerDesc.includes('schedule') || lowerDesc.includes('result')) {
      return 'Suggested Category: Examination, Priority: High';
    } else if (lowerDesc.includes('library') || lowerDesc.includes('book') || lowerDesc.includes('reading')) {
      return 'Suggested Category: Library Services, Priority: Medium';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles].slice(0, 5) // Max 5 files
    }));
  };

  const handleVoiceTranscript = (transcript, audioBlob) => {
    setVoiceTranscript(transcript);
    setFormData(prev => ({
      ...prev,
      description: transcript
    }));
    setShowVoiceInput(false);
  };

  const handleDocumentVerification = (verification) => {
    setVerifiedDocuments(prev => [...prev, verification]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    // Simulate API call
    setTimeout(() => {
      const complaintId = 'G' + Date.now().toString().slice(-6);
      
      // Create complaint object
      const newComplaint = {
        id: complaintId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        department: formData.department,
        status: 'pending',
        studentId: user.studentId || user.email,
        studentName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
        phone: user.phone,
        isAnonymous: formData.isAnonymous,
        attachments: formData.attachments.length,
        submittedBy: user.role, // Track who submitted the complaint
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        progress: 0,
        assignedTo: user.role === 'authority' ? user.name || user.email : 'Not assigned yet'
      };

      // Save to localStorage
      const existingComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
      existingComplaints.push(newComplaint);
      localStorage.setItem('complaints', JSON.stringify(existingComplaints));
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/complaints', { 
          state: { 
            message: 'Complaint submitted successfully!', 
            complaintId 
          } 
        });
      }, 2000);
    }, 2000);
  };

  if (submitStatus === 'success') {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-green-50/90 backdrop-blur-sm border border-green-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-800 to-emerald-800 bg-clip-text text-transparent mb-2">Complaint Submitted Successfully!</h2>
          <p className="text-green-600 mb-4">Your complaint has been registered and will be processed shortly.</p>
          <p className="text-sm text-green-500">Redirecting to your complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Submit New Complaint</h1>
          <p className="text-gray-600">Fill in the details below to submit your grievance</p>
        </div>

      {aiSuggestion && (
        <div className="mb-6 bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">AI Suggestion</h4>
              <p className="text-sm text-blue-600 mt-1">{aiSuggestion}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Complaint Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief title of your complaint"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level *
              </label>
              <select
                id="priority"
                name="priority"
                required
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Related Department *
              </label>
              <select
                id="department"
                name="department"
                required
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Detailed Description *
              </label>
              <button
                type="button"
                onClick={() => setShowVoiceInput(!showVoiceInput)}
                className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                <MicrophoneIcon className="h-4 w-4 mr-1" />
                {showVoiceInput ? 'Hide Voice Input' : 'Use Voice Input'}
              </button>
            </div>
            
            {showVoiceInput && (
              <div className="mb-4">
                <VoiceComplaintInput
                  onTranscriptComplete={handleVoiceTranscript}
                  placeholder="Describe your complaint using voice..."
                />
              </div>
            )}
            
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={showVoiceInput ? "Voice transcript will appear here..." : "Provide a detailed description of your complaint..."}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 50 characters for AI categorization</p>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
                Submit anonymously (Your identity will be hidden from authorities)
              </label>
            </div>
          </div>

          {/* File Attachments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-xs text-gray-500 mt-1">Maximum 5 files, 10MB each</p>
            <input
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Select Files
            </label>
          </div>

          {formData.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-blue-600">
                        {attachment.name.split('.').pop().toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{attachment.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <ExclamationTriangleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Digital Evidence Layer */}
        {formData.attachments.length > 0 && (
          <div className="mb-6">
            <DigitalEvidenceLayer
              attachments={formData.attachments}
              onVerificationComplete={handleDocumentVerification}
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/complaints')}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
        </div>
      </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
