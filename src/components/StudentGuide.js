import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const StudentGuide = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Getting Started',
      icon: UserIcon,
      content: [
        'Register your account using your student email',
        'Complete your profile information',
        'Verify your email address',
        'Log in to access the dashboard'
      ]
    },
    {
      title: 'Submitting a Complaint',
      icon: DocumentTextIcon,
      content: [
        'Click "Submit Complaint" from the sidebar',
        'Fill in all required fields',
        'Select appropriate category and priority',
        'Add detailed description',
        'Attach supporting documents if needed',
        'Submit and track your complaint'
      ]
    },
    {
      title: 'Tracking Progress',
      icon: ClockIcon,
      content: [
        'View all complaints in "My Complaints"',
        'Check status: Pending, In Progress, Resolved',
        'Click "View Details" for full information',
        'Add comments to provide updates',
        'Monitor progress percentage'
      ]
    },
    {
      title: 'Getting Help',
      icon: ChatBubbleLeftRightIcon,
      content: [
        'Visit the Help Center for FAQs',
        'Use the chatbot for quick assistance',
        'Contact support via email or phone',
        'Check your settings for notifications'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/help')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Student Guide</h1>
          </div>
          <p className="text-gray-600">Complete guide for students using the Grievance Portal</p>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <section.icon className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Need More Help?</h3>
              <p className="text-blue-700 text-sm mb-3">
                If you need additional assistance, don't hesitate to contact our support team.
              </p>
              <button
                onClick={() => navigate('/help')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Back to Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGuide;
