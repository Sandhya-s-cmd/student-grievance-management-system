import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const FAQDocument = () => {
  const navigate = useNavigate();

  const faqCategories = [
    {
      category: 'Account & Registration',
      questions: [
        {
          q: 'How do I register for an account?',
          a: 'Click on the "Register" button on the login page. Fill in your personal information, email, and create a password. Your account will be activated immediately.'
        },
        {
          q: 'I forgot my password. How do I reset it?',
          a: 'Click on "Forgot Password" on the login page. Enter your email address and we\'ll send you a password reset link.'
        },
        {
          q: 'Can I change my email address after registration?',
          a: 'Currently, email addresses cannot be changed after registration. Please contact support if you need to update your email.'
        }
      ]
    },
    {
      category: 'Complaint Submission',
      questions: [
        {
          q: 'What types of complaints can I submit?',
          a: 'You can submit complaints related to academic issues, infrastructure, hostel facilities, library services, laboratory equipment, examinations, fee payments, IT services, and administrative matters.'
        },
        {
          q: 'How do I submit a complaint?',
          a: 'Navigate to "Submit Complaint" from the sidebar, fill in all required fields including title, description, category, and priority level. You can also attach supporting documents.'
        },
        {
          q: 'Can I submit an anonymous complaint?',
          a: 'Yes, you can choose to submit complaints anonymously. However, providing your contact information helps us provide better follow-up and updates.'
        },
        {
          q: 'What priority levels are available?',
          a: 'There are three priority levels: High (urgent issues), Medium (important but not urgent), and Low (minor issues).'
        }
      ]
    },
    {
      category: 'Complaint Tracking',
      questions: [
        {
          q: 'How do I track my complaint status?',
          a: 'Go to "My Complaints" in the dashboard. You can view all your submitted complaints along with their current status and progress.'
        },
        {
          q: 'What do the different statuses mean?',
          a: 'Pending: Complaint received and awaiting assignment; In Progress: Being worked on by the relevant department; Resolved: Issue has been addressed and closed.'
        },
        {
          q: 'Can I add comments to my complaint?',
          a: 'Yes, you can add comments to provide additional information or updates to your complaint through the "View Details" page.'
        },
        {
          q: 'How long does it take to resolve a complaint?',
          a: 'Resolution times vary by complexity. Simple issues typically take 3-5 business days, while complex matters may take up to 15 business days.'
        }
      ]
    },
    {
      category: 'Technical Issues',
      questions: [
        {
          q: 'The system is running slowly. What should I do?',
          a: 'Try clearing your browser cache and cookies, or use a different browser. If issues persist, contact our technical support team.'
        },
        {
          q: 'I can\'t see my submitted complaints.',
          a: 'Make sure you\'re logged into the correct account. Try refreshing the page or clicking the "Refresh" button in the complaints list.'
        },
        {
          q: 'What browsers are supported?',
          a: 'We recommend using the latest versions of Chrome, Firefox, Safari, or Edge for the best experience.'
        }
      ]
    },
    {
      category: 'Support & Contact',
      questions: [
        {
          q: 'How can I contact support?',
          a: 'You can reach us via email at support@grievanceportal.edu, phone at +1 (555) 123-4567, or use the live chat feature during business hours.'
        },
        {
          q: 'What are the support hours?',
          a: 'Our support team is available Monday through Friday, 9:00 AM to 6:00 PM.'
        },
        {
          q: 'Where can I find more detailed guides?',
          a: 'Visit the Help Center for comprehensive guides, video tutorials, and step-by-step instructions.'
        }
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
            <h1 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600">Comprehensive list of frequently asked questions</p>
        </div>

        <div className="space-y-8">
          {faqCategories.map((category, index) => (
            <div key={index} className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{category.category}</h2>
              </div>
              <div className="p-6 space-y-6">
                {category.questions.map((faq, faqIndex) => (
                  <div key={faqIndex} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start mb-3">
                      <QuestionMarkCircleIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <h3 className="font-medium text-gray-900">{faq.q}</h3>
                    </div>
                    <div className="ml-8">
                      <p className="text-gray-700">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Still Need Help?</h3>
              <p className="text-blue-700 text-sm mb-3">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/help')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Back to Help Center
                </button>
                <button
                  onClick={() => window.location.href = 'mailto:support@grievanceportal.edu'}
                  className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 text-sm"
                >
                  Email Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQDocument;
