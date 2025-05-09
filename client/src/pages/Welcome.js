import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import animationData from '../assets/animation/interview-animation.json';  // You'll need to get a lottie animation file

const Welcome = () => {
  const [name, setName] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [activeTab, setActiveTab] = useState('new');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdSessionId, setCreatedSessionId] = useState('');
  
  const { startNewSession, continueSession } = useAuth();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
  };

  const handleStartNew = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await startNewSession(name);
      if (result.success) {
        setCreatedSessionId(result.sessionId);
        setShowSuccessModal(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating session');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    
    if (!uniqueId.trim()) {
      toast.error('Please enter your session ID');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await continueSession(uniqueId);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Session not found. Please check your ID.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createdSessionId);
    toast.success('Session ID copied to clipboard!');
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background design elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-10 left-20 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Main content */}
      <motion.div 
        className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row bg-white rounded-2xl shadow-xl overflow-hidden relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Left panel - Illustration */}
        <div className="lg:w-1/2 bg-gradient-to-br from-indigo-500 to-blue-600 p-8 flex flex-col justify-center items-center text-white">
          <div className="mb-8 w-full max-w-md">
            <Lottie 
              animationData={animationData} 
              className="w-full h-auto"
            />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-center">Prepare to Ace Your Interviews</h2>
          <p className="text-center text-indigo-100">
            Practice with AI-powered interviews tailored to your resume and target roles.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Personalized interview questions</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Detailed performance analysis</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>AI-generated feedback & improvement tips</span>
            </div>
          </div>
        </div>
        
        {/* Right panel - Forms */}
        <div className="lg:w-1/2 p-8">
          <div className="flex justify-center items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">InterviewAI<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">Pro</span></span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Welcome to Your Interview Preparation</h1>
          
          {/* Tab navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
            <button 
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'new' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('new')}
            >
              Start New
            </button>
            <button 
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'continue' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('continue')}
            >
              Continue Session
            </button>
          </div>
          
          {/* New Session Form */}
          {activeTab === 'new' && (
            <form onSubmit={handleStartNew} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-md flex justify-center items-center transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Create New Session
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
          
          {/* Continue Session Form */}
          {activeTab === 'continue' && (
            <form onSubmit={handleContinue} className="space-y-6">
              <div>
                <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-1">Session ID</label>
                <input
                  type="text"
                  id="sessionId"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your session ID"
                  value={uniqueId}
                  onChange={(e) => setUniqueId(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 font-medium py-3 px-4 rounded-lg shadow-sm flex justify-center items-center transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Continue Session
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
          
          {/* Instructional note */}
          <div className="mt-8 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-indigo-800">Important: Save Your Session ID</h3>
                <div className="mt-2 text-sm text-indigo-700">
                  <p>After creating a new session, you'll receive a unique ID. Please save this ID in a secure place if you wish to continue your session later.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Session Created Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Session Created!</h3>
              <p className="text-gray-600 mb-6">Your interview session has been created successfully.</p>
              
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-700 mb-2">Your unique session ID:</p>
                <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <code className="text-lg font-mono font-bold text-indigo-600">{createdSessionId}</code>
                  <button 
                    onClick={copyToClipboard}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-indigo-600 mt-2 font-medium">Please save this ID to continue your session later</p>
              </div>
              
              <button
                onClick={navigateToDashboard}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors"
              >
                Continue to Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Welcome;