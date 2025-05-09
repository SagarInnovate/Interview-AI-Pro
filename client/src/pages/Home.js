import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  const canvasRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren", 
        staggerChildren: 0.2,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Three.js background effect
  useEffect(() => {
    if (!canvasRef.current) return;
    
    let animationFrameId;
    let scene, camera, renderer, particlesMesh;
    
    try {
      // Scene setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 50;
      
      renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current, 
        alpha: true,
        antialias: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0xffffff, 0);
      
      // Create particles
      const particlesGeometry = new THREE.BufferGeometry();
      const particleCount = 1000;
      
      const posArray = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.2,
        color: 0x6366f1, // Indigo color
        transparent: true,
        opacity: 0.8
      });
      
      particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);
      
      // Animation
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        particlesMesh.rotation.x += 0.0003;
        particlesMesh.rotation.y += 0.0005;
        renderer.render(scene, camera);
      };
      animate();
      
      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        // Clean up resources
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        if (particlesGeometry) particlesGeometry.dispose();
        if (particlesMaterial) particlesMaterial.dispose();
        if (renderer) renderer.dispose();
        if (scene) {
          scene.clear();
        }
      };
    } catch (error) {
      console.error("Error initializing Three.js:", error);
      // Fallback to a simpler background if Three.js fails
      if (canvasRef.current) {
        canvasRef.current.style.display = 'none';
      }
    }
  }, []);

  // Feature data
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "Intelligent Question Generator",
      description: "Questions dynamically adapt based on your resume, job description, and previous answers.",
      tag: "Industry-specific questions"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: "Real-time Feedback Analysis",
      description: "Get instant feedback on your delivery, content, and overall performance with actionable insights.",
      tag: "Performance metrics"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      title: "Customized Interview Scenarios",
      description: "Practice with role-specific interviews tailored to your target company and position.",
      tag: "Company-specific prep"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Comprehensive Answer Library",
      description: "Access a vast collection of high-quality answers to common interview questions across industries.",
      tag: "250+ question templates"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "AI Speech Analysis",
      description: "Our AI evaluates your tone, pace, and clarity, helping you sound more confident and professional.",
      tag: "Voice confidence training"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      title: "Progress Tracking",
      description: "Track your improvement over time with detailed performance analytics and improvement suggestions.",
      tag: "Performance analytics"
    }
  ];

  // Steps data
  const steps = [
    {
      number: 1,
      title: "Upload Your Resume",
      description: "Our AI analyzes your experience, skills, and career history to personalize your interview."
    },
    {
      number: 2,
      title: "Select Your Target Role",
      description: "Choose from hundreds of job titles or paste a specific job description for targeted preparation."
    },
    {
      number: 3,
      title: "Practice & Improve",
      description: "Conduct realistic interview simulations and receive detailed feedback to continuously improve."
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      content: "InterviewAI Pro helped me prepare for my tech interview at a major tech company. The AI interviewer asked challenging questions that were very similar to what I encountered in my real interview. I got the job!",
      author: "Sarah J.",
      position: "Software Engineer",
      image: "/images/testimonial-1.jpg"
    },
    {
      content: "The real-time feedback on my interview responses was incredibly helpful. I could see exactly where I needed to improve and what I was already doing well. Perfect tool for interview preparation.",
      author: "Michael T.",
      position: "Product Manager",
      image: "/images/testimonial-2.jpg"
    },
    {
      content: "As someone who gets nervous during interviews, being able to practice with AI that feels like a real interviewer made a huge difference in my confidence. Highly recommend this platform!",
      author: "Priya K.",
      position: "Marketing Specialist",
      image: "/images/testimonial-3.jpg"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white to-gray-100 overflow-hidden">
      {/* SEO metadata should be managed in the main HTML template */}
      
      {/* Canvas background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
        aria-hidden="true"
      />
      
      {/* Gradient overlays for visual effect */}
      <div className="absolute inset-0 bg-gradient-radial from-indigo-100/40 to-transparent z-0" aria-hidden="true"></div>
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent z-0" aria-hidden="true"></div>
      
      {/* Navigation */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">InterviewAI<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">Pro</span></span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 transition-colors">Testimonials</a>
              <a href="#premium" className="text-gray-700 hover:text-indigo-600 transition-colors">
                Premium
                <span className="ml-2 inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Coming Soon</span>
              </a>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-indigo-600 focus:outline-none"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className="hidden md:block">
              {currentUser ? (
                <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md transition-all">
                  Dashboard
                </Link>
              ) : (
                <Link to="/welcome" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md transition-all">
                  Get Started
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white rounded-lg shadow-xl p-4 absolute left-4 right-4 z-20">
              <div className="flex flex-col space-y-3">
                <a href="#features" className="text-gray-700 hover:text-indigo-600 transition-colors py-2 px-3 hover:bg-gray-50 rounded-md" onClick={toggleMobileMenu}>Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 transition-colors py-2 px-3 hover:bg-gray-50 rounded-md" onClick={toggleMobileMenu}>How It Works</a>
                <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 transition-colors py-2 px-3 hover:bg-gray-50 rounded-md" onClick={toggleMobileMenu}>Testimonials</a>
                <a href="#premium" className="text-gray-700 hover:text-indigo-600 transition-colors py-2 px-3 hover:bg-gray-50 rounded-md flex items-center" onClick={toggleMobileMenu}>
                  Premium
                  <span className="ml-2 inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Coming Soon</span>
                </a>
                <div className="pt-2 border-t border-gray-200">
                  {currentUser ? (
                    <Link 
                      to="/dashboard" 
                      className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md transition-all text-center"
                      onClick={toggleMobileMenu}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link 
                      to="/welcome" 
                      className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md transition-all text-center"
                      onClick={toggleMobileMenu}
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <motion.main 
        className="relative pt-16 pb-32 flex content-center items-center justify-center z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants}>
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-xs font-medium text-indigo-600 mb-6">
                ✨ AI-Powered Interview Coach
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">Interview Skills</span> With AI
              </h1>
              <p className="text-gray-600 text-lg mb-8 max-w-xl leading-relaxed">
                Build confidence and outshine competitors with personalized AI interview coaching tailored to your experience and target role.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <Link to="/welcome" className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-center text-lg shadow-lg transition-all">
                  Try For Free
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline ml-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <a href="#premium" className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 font-semibold px-8 py-4 rounded-xl text-center text-lg shadow-sm transition-all">
                  Learn About Premium
                </a>
              </div>
              
              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required • Unlimited free practice</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-full bg-indigo-500 rounded-3xl opacity-5 transform rotate-6"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-blue-500 rounded-3xl opacity-5 transform -rotate-2"></div>
                
                <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-xl">
                  <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-semibold text-white">AI Interview Session</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="ml-2 text-xs font-medium text-white">LIVE</span>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gray-50">
                    <div className="flex justify-between mb-8">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-500">AI Interviewer</span>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-500">You</span>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-indigo-500 pl-4 py-2 mb-8">
                      <p className="text-gray-800">Tell me about a challenging project you worked on and how you overcame obstacles to complete it successfully.</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">Candidate's Response</span>
                        <span className="text-xs text-gray-400">00:42</span>
                      </div>
                      <div className="h-10 bg-gray-100 rounded-md flex items-center px-3">
                        <div className="flex space-x-1 items-center">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <div className="flex space-x-2">
                        <button className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all" aria-label="Microphone">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </button>
                        <button className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all" aria-label="Camera">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all" aria-label="Screen share">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-all" aria-label="End call">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-sm font-medium text-blue-600">87%</div>
                          <div className="text-xs text-gray-500">Confidence</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">92%</div>
                          <div className="text-xs text-gray-500">Clarity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-indigo-600">95%</div>
                          <div className="text-xs text-gray-500">Relevance</div>
                        </div>
                      </div>
                      <div>
                        <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white transition-colors">Real-time Analysis</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium mb-4">
              Advanced Features
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cutting-Edge AI Interview Technology</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">Our platform combines state-of-the-art AI with proven interview techniques to create a personalized, immersive experience.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-xl transition-shadow"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-xs text-indigo-600">{feature.tag}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium mb-4">
              Seamless Experience
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How InterviewAI Pro Works</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">Prepare for your next interview in just three simple steps</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12 relative">
            {/* Connecting lines between steps */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200" aria-hidden="true"></div>
            
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="relative"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-md text-center relative z-10">
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg z-10">
                    {step.number}
                  </div>
                  <div className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium mb-4">
              Success Stories
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">InterviewAI Pro has helped thousands of job seekers land their dream jobs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-indigo-600 font-semibold">{testimonial.author.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600">{testimonial.position}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.content}"</p>
                <div className="flex text-indigo-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Feature - Coming Soon Section */}
      <section id="premium" className="py-24 bg-gradient-to-br from-indigo-50 to-blue-50 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-pattern opacity-5" aria-hidden="true"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-300 rounded-full filter blur-3xl opacity-20" aria-hidden="true"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-300 rounded-full filter blur-3xl opacity-20" aria-hidden="true"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <span className="inline-block px-4 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-bold rounded-full shadow-lg">
              Coming Soon
            </span>
          </div>
          
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium mb-6">
                  Premium Experience
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Mock Interviews with Industry Experts</h2>
                <p className="text-gray-600 mb-8">
                  Take your interview preparation to the next level with personalized 1-on-1 sessions with industry experts from top companies. Receive invaluable feedback, insider tips, and coaching from professionals who have conducted real interviews in your target field.
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "30 or 60-minute live interview sessions",
                    "Personalized feedback from industry professionals",
                    "Expert coaching tailored to your target companies",
                    "Insider knowledge about company-specific interview processes",
                    "Detailed written assessment and improvement plan"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div>
                  <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all flex items-center justify-center">
                    <span>Join Waitlist</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-8 md:p-12 text-white flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-6">Meet Our Expert Interviewers</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { name: "Alex Chen", role: "Senior Engineer", company: "Google" },
                    { name: "Maria Rodriguez", role: "Product Manager", company: "Amazon" },
                    { name: "David Kim", role: "UX Designer", company: "Apple" },
                    { name: "Priya Patel", role: "Data Scientist", company: "Microsoft" }
                  ].map((expert, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                        <span className="text-white font-semibold">{expert.name.charAt(0)}</span>
                      </div>
                      <h4 className="font-semibold">{expert.name}</h4>
                      <p className="text-sm text-white/80">{expert.role}</p>
                      <p className="text-xs text-white/60">{expert.company}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                        <span className="text-lg font-bold">P</span>
                      </div>
                      <div>
                        <p className="font-semibold">Premium Benefits</p>
                        <p className="text-xs text-white/70">What you'll get</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs">Coming Q3 2025</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm">Priority access to new features</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm">Discounted rates for 1-on-1 sessions</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm">Unlimited session recordings to review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Ace Your Next Interview?</h2>
          <p className="text-white text-opacity-80 max-w-3xl mx-auto mb-8">Start practicing with AI-powered interview simulations tailored to your experience and target role.</p>
          <Link to="/welcome" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg inline-block transition-colors">
            Get Started Free
          </Link>
          <p className="text-white text-opacity-60 mt-4 text-sm">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">InterviewAI<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">Pro</span></span>
              </div>
              <p className="text-gray-600 text-sm mb-4">Building confidence for your next interview through AI-powered practice and coaching.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors" aria-label="Facebook">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors" aria-label="Twitter">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors" aria-label="LinkedIn">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">How It Works</a></li>
                <li><a href="#premium" className="text-gray-600 hover:text-indigo-600 transition-colors">Premium</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Interview Tips</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Career Guide</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Resume Builder</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} InterviewAI Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;