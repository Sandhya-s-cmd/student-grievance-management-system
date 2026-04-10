import React, { useState, useEffect, useRef, useCallback } from 'react';

const InteractiveBackground = ({ children, className = "" }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [mouseTrail, setMouseTrail] = useState([]);
  const [clickEffects, setClickEffects] = useState([]);
  const [trailIdCounter, setTrailIdCounter] = useState(0);
  const [clickIdCounter, setClickIdCounter] = useState(0);
  const canvasRef = useRef(null);

  // Mouse tracking effect with trail
  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    // Add to mouse trail
    setMouseTrail(prev => {
      const newPoint = {
        x: e.clientX, 
        y: e.clientY, 
        id: `trail-${Date.now()}-${Math.random()}`,
        size: Math.random() * 6 + 2,
        opacity: 0.6
      };
      const newTrail = [...prev, newPoint];
      // Keep only last 10 trail points
      return newTrail.slice(-10);
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

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
  const handleClick = useCallback((e) => {
    const newEffect = {
      id: `click-${Date.now()}-${Math.random()}`,
      x: e.clientX,
      y: e.clientY,
      size: 0,
      maxSize: Math.random() * 100 + 50,
      opacity: 0.6
    };
    setClickEffects(prev => [...prev, newEffect]);
    setClickIdCounter(prev => prev + 1);
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [handleClick]);

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

  // Enhanced particle animation with mouse interaction
  useEffect(() => {
    const particleArray = [];
    const numberOfParticles = 15;
    
    for (let i = 0; i < numberOfParticles; i++) {
      particleArray.push({
        id: `particle-${i}-${Date.now()}`,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1,
        opacity: Math.random() * 0.2 + 0.05,
        hue: Math.random() * 60 + 220, // Blue to purple range
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
          // Mouse repulsion effect (subtle for dashboard)
          const dx = particle.x - mousePosition.x;
          const dy = particle.y - mousePosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const repulsionForce = Math.max(0, 1 - distance / 250);
          
          let newSpeedX = particle.speedX + dx * repulsionForce * 0.01;
          let newSpeedY = particle.speedY + dy * repulsionForce * 0.01;
          
          // Speed limiting
          const maxSpeed = 2;
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
          const pulse = Math.sin(Date.now() * particle.pulseSpeed + particle.pulsePhase) * 0.2 + 0.8;
          
          return {
            ...particle,
            x: newX,
            y: newY,
            speedX: newSpeedX * 0.99, // Damping
            speedY: newSpeedY * 0.99,
            opacity: particle.opacity * pulse
          };
        })
      );
    }, 40);
    
    return () => clearInterval(interval);
  }, [mousePosition]);

  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* Interactive Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.06), rgba(139, 92, 246, 0.04)), linear-gradient(to bottom right, #f8fafc, #f0f9ff, #eef2ff)`
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
            background: `radial-gradient(circle, rgba(59, 130, 246, ${point.opacity}), rgba(99, 102, 241, ${point.opacity * 0.8}))`,
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
          className="absolute rounded-full border-2 border-blue-400 pointer-events-none"
          style={{
            left: `${effect.x}px`,
            top: `${effect.y}px`,
            width: `${effect.size}px`,
            height: `${effect.size}px`,
            opacity: effect.opacity,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.03s ease-out',
            boxShadow: `0 0 ${effect.size/2}px rgba(59, 130, 246, ${effect.opacity * 0.5})`
          }}
        />
      ))}
      
      {/* Enhanced Animated Particles */}
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
            background: `radial-gradient(circle, hsl(${particle.hue}, 70%, 60%), hsl(${particle.hue + 20}, 70%, 50%))`,
            transition: 'all 0.04s linear',
            boxShadow: `0 0 ${particle.size * 2}px hsl(${particle.hue}, 70%, 50%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(0.5px)'
          }}
        />
      ))}
      
      {/* Floating Bubbles */}
      <div className="absolute inset-0">
        {[...Array(2)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full opacity-6 pointer-events-none"
            style={{
              left: `${20 + i * 40}%`,
              top: `${15 + (i % 2) * 40}%`,
              width: `${40 + i * 20}px`,
              height: `${40 + i * 20}px`,
              background: `linear-gradient(135deg, hsl(${220 + i * 20}, 70%, 60%), hsl(${240 + i * 15}, 70%, 50%))`,
              animation: `float ${8 + i * 1}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              filter: 'blur(3px)',
              transform: `scale(${1 + Math.sin(Date.now() * 0.0006 + i) * 0.08})`
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default InteractiveBackground;
