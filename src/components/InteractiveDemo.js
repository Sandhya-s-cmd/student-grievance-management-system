import React, { useState } from 'react';
import { 
  UserIcon, 
  CheckCircleIcon, 
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const InteractiveDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student'
  });

  const steps = [
    {
      title: 'Welcome to Grievance Portal',
      description: 'Experience our streamlined registration process with instant account activation.',
      icon: SparklesIcon,
      color: 'blue'
    },
    {
      title: 'No Email Verification Required',
      description: 'Register and get immediate access - no waiting for email confirmation!',
      icon: ShieldCheckIcon,
      color: 'green'
    },
    {
      title: 'Quick & Easy Registration',
      description: 'Fill out the form, submit, and start using the system right away.',
      icon: ClockIcon,
      color: 'purple'
    },
    {
      title: 'Ready to Go!',
      description: 'Your account is instantly verified and ready for use.',
      icon: CheckCircleIcon,
      color: 'emerald'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Interactive Registration Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how our simplified registration process works - no email verification needed!
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  index <= currentStep 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'bg-white border-gray-300'
                }`}>
                  <step.icon 
                    className={`h-6 w-6 ${
                      index <= currentStep ? 'text-white' : 'text-gray-400'
                    }`} 
                  />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-1 mx-4 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div key={index} className="text-xs text-gray-600 w-20 text-center">
                {step.title.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Step Content */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
              <div className="flex items-center mb-6">
                <currentStepData.icon className="h-8 w-8 mr-3" />
                <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              </div>
              <p className="text-blue-100 mb-8">{currentStepData.description}</p>

              {/* Interactive Demo Form */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">
                      Account Type
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="student" className="text-gray-900">Student</option>
                      <option value="authority" className="text-gray-900">Authority</option>
                      <option value="admin" className="text-gray-900">Administrator</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {currentStep === 3 && (
                <div className="bg-white/10 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="h-6 w-6 mr-2" />
                    <span className="font-medium">Registration Complete!</span>
                  </div>
                  <div className="space-y-2 text-sm text-blue-100">
                    <p>✅ Account created successfully</p>
                    <p>✅ Email automatically verified</p>
                    <p>✅ Ready to use the system</p>
                    <p>✅ No waiting required</p>
                  </div>
                </div>
              )}

              {/* Features List */}
              {currentStep === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-3 text-green-300" />
                    <span>Instant account activation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-3 text-green-300" />
                    <span>No email verification needed</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-3 text-green-300" />
                    <span>Immediate system access</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-3 text-green-300" />
                    <span>Simplified onboarding</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Visual */}
            <div className="p-8 flex items-center justify-center">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-${currentStepData.color}-100 mb-6`}>
                  <currentStepData.icon className={`h-12 w-12 text-${currentStepData.color}-600`} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Step {currentStep + 1} of {steps.length}
                </h3>
                
                <p className="text-gray-600 mb-8">
                  {currentStep === 0 && "Experience the future of user registration"}
                  {currentStep === 1 && "Skip the hassle of email verification"}
                  {currentStep === 2 && "Fill in your details and get started"}
                  {currentStep === 3 && "You're all set to use the system!"}
                </p>

                {/* Navigation Buttons */}
                <div className="flex space-x-4">
                  {!isFirstStep && (
                    <button
                      onClick={handlePrev}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  
                  {!isLastStep ? (
                    <button
                      onClick={handleNext}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      Next Step
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={() => window.location.href = '/register'}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      Try Real Registration
                      <UserIcon className="h-5 w-5 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-lg">
            <SparklesIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-gray-700">
              No email verification required - instant access guaranteed!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;
