import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, AcademicCapIcon, CheckCircleIcon, ExclamationTriangleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Registration = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    department: '',
    phone: '',
    termsAccepted: false,
    year: '',
    section: '',
    facultyType: '',
    facultyId: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [mouseTrail, setMouseTrail] = useState([]);
  const [clickEffects, setClickEffects] = useState([]);
  const [hoveredField, setHoveredField] = useState(null);
  const canvasRef = useRef(null);

  // Mouse tracking effect with trail
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Add to mouse trail
      setMouseTrail(prev => {
        const newTrail = [...prev, { 
          x: e.clientX, 
          y: e.clientY, 
          id: Date.now(),
          size: Math.random() * 6 + 2,
          opacity: 0.6
        }];
        // Keep only last 10 trail points
        return newTrail.slice(-10);
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mouse trail fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setMouseTrail(prev => 
        prev.map(point => ({
          ...point,
          opacity: point.opacity - 0.05,
          size: point.size + 0.2
        })).filter(point => point.opacity > 0)
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  // Click effects
  useEffect(() => {
    const handleClick = (e) => {
      const newEffect = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        size: 0,
        maxSize: 80,
        opacity: 0.8
      };
      setClickEffects(prev => [...prev, newEffect]);
    };
    
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Animate click effects
  useEffect(() => {
    const interval = setInterval(() => {
      setClickEffects(prev => 
        prev.map(effect => ({
          ...effect,
          size: Math.min(effect.size + 3, effect.maxSize),
          opacity: effect.opacity - 0.02
        })).filter(effect => effect.opacity > 0)
      );
    }, 30);
    
    return () => clearInterval(interval);
  }, []);

  // Particle animation effect with enhanced features
  useEffect(() => {
    const particleArray = [];
    const numberOfParticles = 80;
    
    for (let i = 0; i < numberOfParticles; i++) {
      particleArray.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 6 + 1,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.6 + 0.2,
        hue: Math.random() * 60 + 240, // Purple to blue range
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    
    setParticles(particleArray);
  }, []);

  // Enhanced particle animation with mouse interaction
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Mouse repulsion effect
          const dx = particle.x - mousePosition.x;
          const dy = particle.y - mousePosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const repulsionForce = Math.max(0, 1 - distance / 150);
          
          let newSpeedX = particle.speedX + dx * repulsionForce * 0.02;
          let newSpeedY = particle.speedY + dy * repulsionForce * 0.02;
          
          // Speed limiting
          const maxSpeed = 3;
          newSpeedX = Math.max(-maxSpeed, Math.min(maxSpeed, newSpeedX));
          newSpeedY = Math.max(-maxSpeed, Math.min(maxSpeed, newSpeedY));
          
          // Update position with wrapping
          let newX = particle.x + newSpeedX;
          let newY = particle.y + newSpeedY;
          
          if (newX > window.innerWidth) newX = 0;
          if (newX < 0) newX = window.innerWidth;
          if (newY > window.innerHeight) newY = 0;
          if (newY < 0) newY = window.innerHeight;
          
          // Pulsing effect
          const pulse = Math.sin(Date.now() * particle.pulseSpeed + particle.pulsePhase) * 0.3 + 0.7;
          
          return {
            ...particle,
            x: newX,
            y: newY,
            speedX: newSpeedX * 0.98, // Damping
            speedY: newSpeedY * 0.98,
            opacity: particle.opacity * pulse
          };
        })
      );
    }, 30);
    
    return () => clearInterval(interval);
  }, [mousePosition]);

  // Backend simulation
  const checkEmailUniqueness = async (email) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return !users.some(user => user.email === email);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: {
        length: password.length >= minLength,
        uppercase: hasUpperCase,
        lowercase: hasLowerCase,
        numbers: hasNumbers,
        special: hasSpecialChar
      }
    };
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData(prev => ({
      ...prev,
      role: newRole,
      studentId: newRole === 'student' ? '' : prev.studentId,
      department: newRole === 'authority' ? '' : prev.department,
      year: newRole === 'student' ? '' : '',
      section: newRole === 'student' ? '' : '',
      facultyType: newRole === 'authority' ? '' : '',
      facultyId: newRole === 'authority' ? '' : ''
    }));
  };

  const handleFacultyTypeChange = (e) => {
    const newFacultyType = e.target.value;
    setFormData(prev => ({
      ...prev,
      facultyType: newFacultyType,
      department: '' // Reset department when faculty type changes
    }));
  };

  // Get department options based on faculty type
  const getDepartmentOptions = () => {
    if (formData.facultyType === 'teaching') {
      return [
        { value: 'Computer Science', label: 'Computer Science' },
        { value: 'Information Technology', label: 'Information Technology' },
        { value: 'Electronics Engineering', label: 'Electronics Engineering' },
        { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
        { value: 'Civil Engineering', label: 'Civil Engineering' },
        { value: 'Electrical Engineering', label: 'Electrical Engineering' },
        { value: 'Chemical Engineering', label: 'Chemical Engineering' },
        { value: 'Biotechnology', label: 'Biotechnology' },
        { value: 'Physics', label: 'Physics' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'English', label: 'English' }
      ];
    } else if (formData.facultyType === 'non-teaching') {
      return [
        { value: 'Administration', label: 'Administration' },
        { value: 'Library', label: 'Library' },
        { value: 'Accounts', label: 'Accounts' },
        { value: 'Student Affairs', label: 'Student Affairs' },
        { value: 'Placement', label: 'Placement' },
        { value: 'Sports', label: 'Sports' },
        { value: 'Hostel Management', label: 'Hostel Management' },
        { value: 'Transport', label: 'Transport' },
        { value: 'Maintenance', label: 'Maintenance' },
        { value: 'Security', label: 'Security' },
        { value: 'IT Support', label: 'IT Support' },
        { value: 'HR', label: 'HR' }
      ];
    }
    return [];
  };

  const validateForm = async () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@aurora\.edu\.in$/.test(formData.email)) {
      newErrors.email = 'Only @aurora.edu.in email addresses are allowed';
    } else if (!(await checkEmailUniqueness(formData.email))) {
      newErrors.email = 'Email already exists';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password).isValid) {
      newErrors.password = 'Password does not meet requirements';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Role-specific validation
    if (formData.role === 'student') {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
      } else if (!/^AU\d{4}[A-Z]{2,3}\d{3}$/.test(formData.studentId)) {
        newErrors.studentId = 'Student ID must be in format: AU2023CS001 (AU + Year + Dept + Number)';
      }
      if (!formData.year.trim()) {
        newErrors.year = 'Year is required';
      }
      if (!formData.section.trim()) {
        newErrors.section = 'Section is required';
      }
      if (!formData.department.trim()) {
        newErrors.department = 'Department is required';
      }
    }
    
    if (formData.role === 'authority' && !formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    if (formData.role === 'authority' && !formData.facultyType.trim()) {
      newErrors.facultyType = 'Faculty type is required';
    }
    if (formData.role === 'authority' && !formData.facultyId.trim()) {
      newErrors.facultyId = 'Faculty ID is required';
    }
    
    if (!formData.termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const isValid = await validateForm();
      
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create user object
      const newUser = {
        id: 'user_' + Date.now(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password, // In real app, this would be hashed
        role: formData.role,
        studentId: formData.studentId,
        department: formData.department,
        phone: formData.phone,
        year: formData.year,
        section: formData.section,
        facultyType: formData.facultyType,
        facultyId: formData.facultyId,
        emailVerified: true, // Auto-verify email for demo purposes
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Show success message
      setRegistrationSuccess(true);
      
      // Redirect after delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Interactive Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1), rgba(20, 184, 166, 0.1))`
          }}
        />
        
        {/* Animated Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-purple-400"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              transition: 'all 0.05s linear'
            }}
          />
        ))}
        
        {/* Floating Bubbles */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={`bubble-${i}`}
              className="absolute rounded-full bg-gradient-to-r from-purple-200 to-blue-200 opacity-20 animate-pulse"
              style={{
                left: `${15 + i * 15}%`,
                top: `${10 + (i % 2) * 30}%`,
                width: `${60 + i * 20}px`,
                height: `${60 + i * 20}px`,
                animation: `float ${3 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold bg-gradient-to-r from-green-900 to-teal-900 bg-clip-text text-transparent">Registration Successful!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your account has been created successfully. Redirecting to login...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Enhanced Interactive Background with Multiple Layers */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.15), rgba(20, 184, 166, 0.1)), linear-gradient(to bottom right, #faf5ff, #f0f9ff, #f0fdfa)`
        }}
      />
      
      {/* Mouse Trail Effect */}
      {mouseTrail.map(point => (
        <div
          key={point.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            width: `${point.size}px`,
            height: `${point.size}px`,
            opacity: point.opacity,
            background: `radial-gradient(circle, rgba(147, 51, 234, ${point.opacity}), rgba(59, 130, 246, ${point.opacity * 0.8}))`,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.1s ease-out',
            filter: 'blur(1px)'
          }}
        />
      ))}
      
      {/* Click Ripple Effects */}
      {clickEffects.map(effect => (
        <div
          key={effect.id}
          className="absolute rounded-full border-2 border-purple-400 pointer-events-none"
          style={{
            left: `${effect.x}px`,
            top: `${effect.y}px`,
            width: `${effect.size}px`,
            height: `${effect.size}px`,
            opacity: effect.opacity,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.03s ease-out',
            boxShadow: `0 0 ${effect.size/2}px rgba(147, 51, 234, ${effect.opacity * 0.5})`
          }}
        />
      ))}
      
      {/* Enhanced Animated Particles with Mouse Interaction */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            background: `radial-gradient(circle, hsl(${particle.hue}, 70%, 60%), hsl(${particle.hue + 30}, 70%, 50%))`,
            transition: 'all 0.03s linear',
            boxShadow: `0 0 ${particle.size * 3}px hsl(${particle.hue}, 70%, 50%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(0.5px)'
          }}
        />
      ))}
      
      {/* Enhanced Floating Bubbles with Gradients */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full opacity-15 pointer-events-none"
            style={{
              left: `${5 + i * 8}%`,
              top: `${5 + (i % 4) * 20}%`,
              width: `${60 + i * 25}px`,
              height: `${60 + i * 25}px`,
              background: `linear-gradient(135deg, hsl(${250 + i * 10}, 70%, 60%), hsl(${200 + i * 15}, 70%, 50%), hsl(${180 + i * 8}, 70%, 40%))`,
              animation: `float ${5 + i * 0.7}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
              filter: 'blur(2px)',
              transform: `scale(${1 + Math.sin(Date.now() * 0.001 + i) * 0.1})`
            }}
          />
        ))}
      </div>
      
      {/* Enhanced Wave Effect with Multiple Layers */}
      <div className="absolute bottom-0 left-0 right-0 h-48 opacity-30 pointer-events-none">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-purple-300/40 via-blue-300/40 to-teal-300/40"
          style={{
            animation: 'wave 10s ease-in-out infinite',
            transform: 'translateY(30px)'
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-300/30 via-teal-300/30 to-purple-300/30"
          style={{
            animation: 'wave 12s ease-in-out infinite reverse',
            transform: 'translateY(40px)'
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-r from-teal-300/20 via-purple-300/20 to-blue-300/20"
          style={{
            animation: 'wave 8s ease-in-out infinite',
            transform: 'translateY(50px)'
          }}
        />
      </div>
      
      {/* Interactive Glow Zones */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{
            left: '10%',
            top: '20%',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4), transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full opacity-20"
          style={{
            right: '15%',
            bottom: '30%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4), transparent 70%)',
            animation: 'pulse 5s ease-in-out infinite reverse'
          }}
        />
      </div>
      
      <div className="max-w-2xl w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-3 shadow-lg">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold bg-gradient-to-r from-purple-900 to-blue-900 bg-clip-text text-transparent">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our Grievance Portal
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 transform transition-all duration-300 animate-pulse">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-800">{errors.submit}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                        errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                        errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                      }`}
                      placeholder="your.email@aurora.edu.in"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 hover:border-purple-400"
                      placeholder="+91-9876543210"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Account Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Account Type *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleRoleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 hover:border-purple-400"
                    >
                      <option value="student">Student</option>
                      <option value="authority">Authority</option>
                    </select>
                    {errors.role && (
                      <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.role}</p>
                    )}
                  </div>

                  {formData.role === 'student' && (
                    <div className="animate-fade-in space-y-4">
                      <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                        Student ID *
                      </label>
                      <input
                        id="studentId"
                        name="studentId"
                        type="text"
                        value={formData.studentId}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                        className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                          errors.studentId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                        }`}
                        placeholder="AU2023CS001"
                      />
                      {errors.studentId && (
                        <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.studentId}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Format: AU + Year + Department Code + Number (e.g., AU2023CS001)
                      </p>
                      <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-gray-600">
                        <span className="font-medium">Dept Codes:</span> CS=Computer Science, IT=IT, EC=Electronics, ME=Mechanical, CE=Civil, EE=Electrical, CH=Chemical, BT=Biotechnology
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                            Year *
                          </label>
                          <select
                            id="year"
                            name="year"
                            value={formData.year}
                            onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                            className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                              errors.year ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                            }`}
                          >
                            <option value="">Select Year</option>
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            <option value="3rd">3rd Year</option>
                            <option value="4th">4th Year</option>
                          </select>
                          {errors.year && (
                            <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.year}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="section" className="block text-sm font-medium text-gray-700">
                            Section *
                          </label>
                          <select
                            id="section"
                            name="section"
                            value={formData.section}
                            onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                            className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                              errors.section ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                            }`}
                          >
                            <option value="">Select Section</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                            <option value="D">Section D</option>
                          </select>
                          {errors.section && (
                            <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.section}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                          Department *
                        </label>
                        <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                          className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                            errors.department ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <option value="">Select Department</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electronics Engineering">Electronics Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Chemical Engineering">Chemical Engineering</option>
                          <option value="Biotechnology">Biotechnology</option>
                        </select>
                        {errors.department && (
                          <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.department}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.role === 'authority' && (
                    <div className="animate-fade-in space-y-4">
                      <div>
                        <label htmlFor="facultyType" className="block text-sm font-medium text-gray-700">
                          Faculty Type *
                        </label>
                        <select
                          id="facultyType"
                          name="facultyType"
                          value={formData.facultyType}
                          onChange={handleFacultyTypeChange}
                          className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                            errors.facultyType ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <option value="">Select Faculty Type</option>
                          <option value="teaching">Teaching Faculty</option>
                          <option value="non-teaching">Non-Teaching Faculty</option>
                        </select>
                        {errors.facultyType && (
                          <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.facultyType}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="facultyId" className="block text-sm font-medium text-gray-700">
                          Faculty ID *
                        </label>
                        <input
                          id="facultyId"
                          name="facultyId"
                          type="text"
                          value={formData.facultyId}
                          onChange={(e) => setFormData(prev => ({ ...prev, facultyId: e.target.value }))}
                          className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                            errors.facultyId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                          }`}
                          placeholder="Enter your faculty ID"
                        />
                        {errors.facultyId && (
                          <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.facultyId}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                          Department *
                        </label>
                        <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                          disabled={!formData.facultyType}
                          className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                            errors.department ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                          } ${!formData.facultyType ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        >
                          <option value="">
                            {formData.facultyType ? 'Select Department' : 'Select Faculty Type First'}
                          </option>
                          {getDepartmentOptions().map(dept => (
                            <option key={dept.value} value={dept.value}>
                              {dept.label}
                            </option>
                          ))}
                        </select>
                        {errors.department && (
                          <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.department}</p>
                        )}
                        {!formData.facultyType && (
                          <p className="mt-2 text-sm text-gray-500 animate-fade-in">Please select faculty type to see available departments</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2 text-purple-600" />
              Security Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={`mt-1 block w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-purple-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-purple-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.password}</p>
                )}
                
                {/* Password Requirements */}
                <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                  <div className="space-y-1">
                    {['length', 'uppercase', 'lowercase', 'numbers', 'special'].map((req) => {
                      const passwordValidation = validatePassword(formData.password);
                      const isValid = passwordValidation.errors[req];
                      return (
                        <div key={req} className="flex items-center text-xs">
                          {isValid ? (
                            <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-gray-300 mr-1" />
                          )}
                          <span className={isValid ? 'text-green-600' : 'text-gray-500'}>
                            {req === 'length' && 'At least 8 characters'}
                            {req === 'uppercase' && 'One uppercase letter'}
                            {req === 'lowercase' && 'One lowercase letter'}
                            {req === 'numbers' && 'One number'}
                            {req === 'special' && 'One special character'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`mt-1 block w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-purple-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-purple-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms and Submit */}
          <div className="bg-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="terms"
                  name="termsAccepted"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I accept the terms and conditions and privacy policy *
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600 animate-fade-in">{errors.terms}</p>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;
