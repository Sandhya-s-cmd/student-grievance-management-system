import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserIcon, EyeIcon, EyeSlashIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [mouseTrail, setMouseTrail] = useState([]);
  const [clickEffects, setClickEffects] = useState([]);
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

  // JWT token management
  const generateJWT = (user) => {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    // Simple JWT simulation (use proper JWT library in production)
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.secret`);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  };

  const verifyJWT = (token) => {
    try {
      const [header, payload, signature] = token.split('.');
      const decodedPayload = JSON.parse(atob(payload));
      
      // Check expiration
      if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      
      return decodedPayload;
    } catch (error) {
      return null;
    }
  };

  const decryptPassword = (encryptedPassword) => {
    try {
      return atob(encryptedPassword);
    } catch (error) {
      return encryptedPassword;
    }
  };

  const encryptPassword = (password) => {
    try {
      return btoa(password);
    } catch (error) {
      return password;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (token) {
      const decodedToken = verifyJWT(token);
      if (decodedToken) {
        // Restore user session
        const userData = {
          id: decodedToken.userId,
          email: decodedToken.email,
          role: decodedToken.role,
          name: decodedToken.name
        };
        
        setUser(userData);
        navigate('/');
        return;
      } else {
        // Token expired, clean up
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (!rememberMe) {
          localStorage.removeItem('rememberMe');
        }
      }
    }

    // Check for registration success message
    if (location.state?.registrationSuccess) {
      setLoginSuccess(true);
    }
  }, [navigate, setUser, location.state]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@aurora\.edu\.in$/.test(formData.email)) {
      newErrors.email = 'Only @aurora.edu.in email addresses are allowed';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const isValid = validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check for existing users in localStorage (backend simulation)
      let existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Create default authority user if none exists
      const authorityExists = existingUsers.some(u => u.role === 'authority');
      if (!authorityExists) {
        const defaultAuthority = {
          id: 'authority_default',
          firstName: 'Default',
          lastName: 'Authority',
          email: 'authority@demo.com',
          password: 'authority123', // Plain text for demo
          role: 'authority',
          department: 'Academic Affairs',
          emailVerified: true,
          createdAt: new Date().toISOString()
        };
        existingUsers.push(defaultAuthority);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        console.log('Created default authority user:', defaultAuthority);
      }
      
      // Create default admin user if none exists
      const adminExists = existingUsers.some(u => u.role === 'admin');
      if (!adminExists) {
        const defaultAdmin = {
          id: 'admin_default',
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@aurora.edu.in',
          password: encryptPassword('admin123'), // Encrypt the password
          role: 'admin',
          department: 'System Administration',
          emailVerified: true,
          createdAt: new Date().toISOString()
        };
        existingUsers.push(defaultAdmin);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        console.log('Created default admin user:', defaultAdmin);
      } else {
        // Update existing admin to use correct email if needed
        const adminIndex = existingUsers.findIndex(u => u.role === 'admin');
        if (adminIndex !== -1 && existingUsers[adminIndex].email !== 'admin@aurora.edu.in') {
          existingUsers[adminIndex] = {
            ...existingUsers[adminIndex],
            email: 'admin@aurora.edu.in',
            password: encryptPassword('admin123'),
            emailVerified: true
          };
          localStorage.setItem('users', JSON.stringify(existingUsers));
          console.log('Updated admin user credentials:', existingUsers[adminIndex]);
        }
      }
      
      console.log('Attempting login with:', formData.email);
      console.log('Existing users:', existingUsers);
      
      // Debug: Check if admin user exists
      const adminUser = existingUsers.find(u => u.role === 'admin');
      console.log('Admin user found:', adminUser);
      if (adminUser) {
        console.log('Admin email:', adminUser.email);
        console.log('Admin password (encrypted):', adminUser.password);
        console.log('Password match test:', decryptPassword(adminUser.password) === formData.password);
      }
      
      let user = null;
      
      // Find user by email and verify password
      user = existingUsers.find(u => {
        const decryptedPassword = decryptPassword(u.password);
        const emailMatch = u.email === formData.email;
        const passwordMatch = decryptedPassword === formData.password;
        const emailVerified = u.emailVerified !== false; // Default to true if not set
        
        console.log('Checking user:', {
          email: u.email,
          role: u.role,
          emailMatch,
          passwordMatch,
          emailVerified,
          inputPassword: formData.password,
          decryptedPassword
        });
        
        return emailMatch && passwordMatch && emailVerified;
      });
      
      // Special admin bypass - if admin credentials are correct, create/update admin user
      if (!user && formData.email === 'admin@aurora.edu.in' && formData.password === 'admin123') {
        console.log('Admin bypass triggered - creating/updating admin user');
        const adminUser = {
          id: 'admin_default',
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@aurora.edu.in',
          password: encryptPassword('admin123'),
          role: 'admin',
          department: 'System Administration',
          emailVerified: true,
          createdAt: new Date().toISOString()
        };
        
        // Remove existing admin if any
        existingUsers = existingUsers.filter(u => u.role !== 'admin');
        existingUsers.push(adminUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        
        user = adminUser;
        console.log('Admin user created/updated:', adminUser);
      }
      
      console.log('User found:', user);
      
      if (user) {
        // Generate JWT token
        const token = generateJWT(user);
        
        // Create user session data
        const userData = {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          department: user.department,
          studentId: user.studentId,
          phone: user.phone
        };
        
        // Store authentication data
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        
        setUser(userData);
        navigate('/');
      } else {
        setErrors({ submit: 'Invalid email or password. Please check your credentials and verify your email if not done.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    // Simulate password reset
    const email = prompt('Enter your email address for password reset:');
    if (email) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (user) {
        alert(`Password reset link has been sent to ${email}. (This is a simulation)`);
      } else {
        alert('No account found with this email address.');
      }
    }
  };

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
      
      <div className='max-w-md w-full space-y-8 relative z-10'>
        <div className='text-center'>
          <div className='mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-3 shadow-lg'>
            <UserIcon className='h-8 w-8 text-white' />
          </div>
          <h2 className='mt-6 text-3xl font-extrabold bg-gradient-to-r from-purple-900 to-blue-900 bg-clip-text text-transparent'>Welcome Back</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Sign in to your Grievance Portal
          </p>
        </div>

        {loginSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 transform transition-all duration-300 animate-pulse">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <p className="ml-3 text-sm text-green-800">
                Registration successful! Please login with your credentials.
              </p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 transform transition-all duration-300 animate-pulse">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-800">{errors.submit}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 transform transition-all duration-300 hover:shadow-xl">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 hover:border-purple-400"
                placeholder="your.email@aurora.edu.in"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm pr-10 transition-all duration-200 hover:border-purple-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-purple-600 transition-colors" /> : <EyeIcon className="h-4 w-4 text-gray-400 hover:text-purple-600 transition-colors" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transform transition-all duration-200 hover:scale-105"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-r from-purple-50 via-blue-50 to-teal-50 text-gray-500">New to our system?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-200 hover:scale-105"
              >
                Create an account
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
