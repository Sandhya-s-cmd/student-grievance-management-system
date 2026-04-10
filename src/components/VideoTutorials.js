import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlayIcon,
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const VideoTutorials = () => {
  const navigate = useNavigate();

  const tutorials = [
    {
      title: 'Getting Started with the Portal',
      description: 'Learn how to register, set up your profile, and navigate the dashboard.',
      duration: '5:30',
      level: 'Beginner',
      status: 'coming-soon',
      icon: UserIcon
    },
    {
      title: 'Submitting Your First Complaint',
      description: 'Step-by-step guide to filling out and submitting a complaint form.',
      duration: '8:45',
      level: 'Beginner',
      status: 'coming-soon',
      icon: DocumentTextIcon
    },
    {
      title: 'Tracking Complaint Progress',
      description: 'How to monitor your complaint status and understand different stages.',
      duration: '6:20',
      level: 'Intermediate',
      status: 'coming-soon',
      icon: ClockIcon
    },
    {
      title: 'Using Advanced Features',
      description: 'Learn about comments, attachments, and notification settings.',
      duration: '7:15',
      level: 'Advanced',
      status: 'coming-soon',
      icon: PlayIcon
    },
    {
      title: 'Mobile App Guide',
      description: 'Using the Grievance Portal on mobile devices and tablets.',
      duration: '4:30',
      level: 'Beginner',
      status: 'coming-soon',
      icon: UserIcon
    },
    {
      title: 'Troubleshooting Common Issues',
      description: 'Solutions for frequently encountered problems and errors.',
      duration: '9:10',
      level: 'Intermediate',
      status: 'coming-soon',
      icon: ExclamationTriangleIcon
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'coming-soon':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-blue-100 text-blue-800';
      case 'Intermediate':
        return 'bg-purple-100 text-purple-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Video Tutorials</h1>
          </div>
          <p className="text-gray-600">Step-by-step video guides for common tasks</p>
        </div>

        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-yellow-900 mb-2">Videos Coming Soon!</h3>
              <p className="text-yellow-700 text-sm">
                We're currently creating comprehensive video tutorials for all features. 
                You can add your own videos by replacing the placeholder content in the future.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tutorial, index) => (
            <div key={index} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <tutorial.icon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tutorial.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelBadge(tutorial.level)}`}>
                          {tutorial.level}
                        </span>
                        <span className="text-sm text-gray-500">{tutorial.duration}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(tutorial.status)}`}>
                    {tutorial.status === 'coming-soon' ? 'Coming Soon' : 'Available'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{tutorial.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <PlayIcon className="h-4 w-4 mr-1" />
                    {tutorial.duration}
                  </div>
                  {tutorial.status === 'available' ? (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                      Watch Now
                    </button>
                  ) : (
                    <button 
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm cursor-not-allowed"
                      disabled
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Add Your Own Videos</h3>
              <p className="text-blue-700 text-sm mb-3">
                You can easily add your own video content by updating this component with your video URLs and descriptions.
              </p>
              <div className="space-y-2 text-sm text-blue-600">
                <p>• Upload videos to YouTube or Vimeo</p>
                <p>• Replace placeholder content with actual video embeds</p>
                <p>• Update tutorial descriptions and durations</p>
                <p>• Change status from "coming-soon" to "available"</p>
              </div>
              <button
                onClick={() => navigate('/help')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
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

export default VideoTutorials;
