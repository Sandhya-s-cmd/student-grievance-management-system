import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const Help = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const faqSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: InformationCircleIcon,
      questions: [
        {
          question: 'How do I register for an account?',
          answer: 'Click on the "Register" button on the login page. Fill in your personal information, email, and create a password. Your account will be activated immediately.'
        },
        {
          question: 'How do I submit a complaint?',
          answer: 'Navigate to the "Submit Complaint" section from the sidebar. Fill in all required fields including complaint type, description, and any supporting documents. Click "Submit" to file your complaint.'
        },
        {
          question: 'How do I track my complaint status?',
          answer: 'Go to "My Complaints" in the dashboard. You can view all your submitted complaints along with their current status, assigned department, and expected resolution time.'
        }
      ]
    },
    {
      id: 'complaint-process',
      title: 'Complaint Process',
      icon: DocumentTextIcon,
      questions: [
        {
          question: 'What happens after I submit a complaint?',
          answer: 'Your complaint is automatically assigned to the relevant department. You will receive notifications about status changes and can track progress in real-time.'
        },
        {
          question: 'How long does it take to resolve a complaint?',
          answer: 'Resolution times vary by complaint type. Simple issues are typically resolved within 3-5 business days, while complex matters may take up to 15 business days.'
        },
        {
          question: 'Can I edit my complaint after submission?',
          answer: 'Yes, you can edit your complaint within 24 hours of submission. After that, you\'ll need to contact the assigned department directly for any changes.'
        }
      ]
    },
    {
      id: 'account-settings',
      title: 'Account & Settings',
      icon: QuestionMarkCircleIcon,
      questions: [
        {
          question: 'How do I update my profile information?',
          answer: 'Navigate to "Settings" from the sidebar. In the Profile tab, you can update your personal information, contact details, and preferences.'
        },
        {
          question: 'How do I change my password?',
          answer: 'Go to Settings > Security tab. Enter your current password and then your new password. Passwords must be at least 8 characters long.'
        },
        {
          question: 'How do I configure notifications?',
          answer: 'In Settings > Notifications tab, you can choose which notifications you want to receive via email or push notifications.'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: ExclamationTriangleIcon,
      questions: [
        {
          question: 'I forgot my password. How do I reset it?',
          answer: 'Click on "Forgot Password" on the login page. Enter your email address and we\'ll send you a password reset link.'
        },
        {
          question: 'Why can\'t I see my complaints?',
          answer: 'Make sure you\'re logged into the correct account. If the issue persists, contact support with your registered email address.'
        },
        {
          question: 'The system is running slowly. What should I do?',
          answer: 'Try clearing your browser cache and cookies, or try using a different browser. If issues persist, our technical team can assist you.'
        }
      ]
    }
  ];

  const contactOptions = [
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      description: 'Monday - Friday, 9:00 AM - 6:00 PM',
      contact: '+1 (555) 123-4567',
      color: 'blue'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      description: 'We respond within 24 hours',
      contact: 'support@grievanceportal.edu',
      color: 'green'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      description: 'Available during business hours',
      contact: 'Start chat in bottom-right corner',
      color: 'purple'
    }
  ];

  const quickGuides = [
    {
      title: 'Student Guide',
      description: 'Complete guide for students using the Grievance Portal',
      icon: DocumentTextIcon,
      link: '/student-guide'
    },
    {
      title: 'FAQ Document',
      description: 'Comprehensive list of frequently asked questions',
      icon: QuestionMarkCircleIcon,
      link: '/faq'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for common tasks',
      icon: DocumentTextIcon,
      link: '/tutorials'
    }
  ];

  const handleGuideClick = (link) => {
    // Navigate to the appropriate guide page
    navigate(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          </div>
          <p className="text-gray-600">Find answers to common questions and get support</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickGuides.map((guide, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <guide.icon className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">{guide.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{guide.description}</p>
              <button 
                onClick={() => handleGuideClick(guide.link)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View Guide →
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {faqSections.map((section) => (
              <div key={section.id} className="p-6">
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center">
                    <section.icon className="h-5 w-5 text-gray-400 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                  </div>
                  <div className={`transform transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`}>
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {expandedSection === section.id && (
                  <div className="mt-4 space-y-4">
                    {section.questions.map((qa, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{qa.question}</h4>
                        <p className="text-gray-600">{qa.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Options */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Contact Support</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactOptions.map((option, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${option.color}-100 mb-4`}>
                    <option.icon className={`h-6 w-6 text-${option.color}-600`} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-gray-600 mb-2">{option.description}</p>
                  <p className={`text-${option.color}-600 font-medium`}>{option.contact}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Need immediate assistance?</h4>
                  <p className="text-blue-700 text-sm">
                    Our support team is available during business hours to help you with any issues or questions you may have.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
