import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';
import { spaceService, interviewService } from '../services/api';

// Components
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import InterviewRoundCard from '../components/InterviewRoundCard';
import RoundSummaryModal from '../components/RoundSummaryModal';

const SpaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rounds');
  const [selectedRound, setSelectedRound] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  useEffect(() => {
    fetchSpaceDetails();
  }, [id]);
  
  const fetchSpaceDetails = async () => {
    try {
      setLoading(true);
      const response = await spaceService.getSpaceDetails(id);
      setSpace(response.data.space);
    } catch (error) {
      console.error('Error fetching space details:', error);
      toast.error('Failed to load interview space details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSummary = (round) => {
    setSelectedRound(round);
    setShowSummaryModal(true);
  };
  

  const closeSummaryModal = () => {
    setShowSummaryModal(false);
  };
  
  const fetchRoundQuestions = async (roundId) => {
    try {
      const response = await interviewService.getQuestionsAnswers(roundId);
      return response.data;
    } catch (error) {
      console.error('Error fetching questions and answers:', error);
      return [];
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  // Calculate progress
  const completedRounds = space?.interviewRounds?.filter(r => r.status === 'completed')?.length || 0;
  const totalRounds = space?.interviewRounds?.length || 0;
  const progressPercentage = totalRounds > 0 ? Math.round((completedRounds / totalRounds) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Space Not Found</h2>
          <p className="text-gray-600 mb-8">The interview space you're looking for doesn't exist or may have been removed.</p>
          <Link 
            to="/dashboard" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb navigation */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900">Interview Space</span>
          </div>
        </div>
        
        {/* Company header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-12 relative">
            {/* Decorative elements */}
            <div className="absolute top-4 left-8 w-12 h-12 rounded-full bg-indigo-400/10"></div>
            <div className="absolute bottom-8 right-12 w-16 h-16 rounded-full bg-blue-400/10"></div>
            <div className="absolute top-12 right-36 w-8 h-8 rounded-full bg-indigo-400/10"></div>
            
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{space.jobPosition}</h1>
              <p className="text-xl text-gray-600">{space.companyName}</p>
              
              <div className="mt-6 flex flex-wrap gap-4">
                {/* Progress card */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4 border border-gray-100">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Overall Progress</p>
                    <div className="flex items-center">
                      <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Rounds summary card */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4 border border-gray-100">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rounds Completed</p>
                    <p className="text-lg font-medium text-gray-900">{completedRounds} of {totalRounds}</p>
                  </div>
                </div>
                
                {/* Action button */}
                <div className="ml-auto flex items-end">
                  <Link 
                    to="/dashboard" 
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content tabs */}
        <div>
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'rounds'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
              onClick={() => setActiveTab('rounds')}
            >
              Interview Rounds
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
              onClick={() => setActiveTab('details')}
            >
              Job Details
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'resume'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
              onClick={() => setActiveTab('resume')}
            >
              Resume
            </button>
          </div>
          
          {/* Tab content */}
          <div>
            {/* Interview Rounds Tab */}
            {activeTab === 'rounds' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {space.interviewRounds.map((round, index) => (
                  <motion.div key={round._id || index} variants={cardVariants}>
                    <InterviewRoundCard 
                      round={round} 
                      spaceId={space._id} 
                      onViewSummary={() => handleViewSummary(round)} 
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
            
{activeTab === 'details' && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Job Description</h3>
      {space?.jobDescription && space.jobDescription !== 'N/A' ? (
        <div className="prose prose-indigo max-w-none">
          <ReactMarkdown>{space.jobDescription}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No job description available</p>
        </div>
      )}
    </div>
  </motion.div>
)}
            
            {/* Resume Tab */}
            {activeTab === 'resume' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Resume Summary</h3>
                    {space.resumePath && (
                      <a
                        href={`/api/spaces/resume/${space._id}`}
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Resume
                      </a>
                    )}
                  </div>
                  
                  {space.purifiedSummary ? (
                    <div className="prose prose-indigo max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: space.purifiedSummary }} />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">Resume summary not available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      
      {/* Round Summary Modal */}
      {selectedRound && (
        <RoundSummaryModal
          isOpen={showSummaryModal}
          onClose={closeSummaryModal}
          round={selectedRound}
          spaceId={space._id}
          fetchQuestions={fetchRoundQuestions}
        />
      )}
    </div>
  );
};

export default SpaceDetails;