import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

const RoundSummaryModal = ({ isOpen, onClose, round, spaceId, fetchQuestions }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && round?._id) {
      loadQuestions();
    }
  }, [isOpen, round, fetchQuestions]); // Added fetchQuestions as a dependency

  const loadQuestions = async () => {
    if (!round?._id) return;
    
    setLoading(true);
    try {
      const questionsData = await fetchQuestions(round._id);
      console.log("API returned:", questionsData);
      
      // Check if the data is nested in a property
      const formattedData = questionsData?.questionsAnswers || questionsData?.data || questionsData || [];
      console.log("Using data:", formattedData);
      
      setQuestions(formattedData);
    } catch (error) {
      console.error('Error loading questions:', error);
      // Set empty array on error to avoid undefined issues
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeAgain = () => {
    onClose();
    navigate(`/space/${spaceId}/round/${round.name}/start`);
  };

  // Extract key points from the summary
  const extractKeyPoints = (summary) => {
    if (!summary) return { strengths: [], improvements: [] };
    
    // Simple extraction based on keywords
    const strengths = [];
    const improvements = [];
    
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      // Check for strength indicators
      if (
        lowerSentence.includes('strength') || 
        lowerSentence.includes('good') || 
        lowerSentence.includes('excellent') || 
        lowerSentence.includes('impressive') ||
        lowerSentence.includes('well done')
      ) {
        strengths.push(sentence.trim());
      }
      
      // Check for improvement indicators
      if (
        lowerSentence.includes('improve') || 
        lowerSentence.includes('could') || 
        lowerSentence.includes('should') || 
        lowerSentence.includes('consider') ||
        lowerSentence.includes('work on')
      ) {
        improvements.push(sentence.trim());
      }
    });
    
    // If we didn't find any, try a more aggressive approach
    if (strengths.length === 0) {
      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        if (
          lowerSentence.includes('demonstrated') ||
          lowerSentence.includes('showed') ||
          lowerSentence.includes('clear') ||
          lowerSentence.includes('strong')
        ) {
          strengths.push(sentence.trim());
        }
      });
    }
    
    return {
      strengths: strengths.slice(0, 3), // Limit to top 3
      improvements: improvements.slice(0, 3) // Limit to top 3
    };
  };

  // Add this function to calculate performance metrics
  const calculatePerformanceMetrics = () => {
    if (!questions || questions.length === 0) {
      return {
        communication: 0,
        technical: 0,
        problemSolving: 0,
        overall: 0
      };
    }

    // Basic analytics - use more sophisticated analysis in production
    const metrics = {
      communication: 0,
      technical: 0,
      problemSolving: 0
    };

    // Analyze answers for key patterns
    questions.forEach(qa => {
      // Guard against undefined answers
      const answer = (qa && qa.answer) ? qa.answer : '';
      
      // Communication score based on answer length and structure
      const wordCount = answer.split(/\s+/).filter(Boolean).length; // Filter out empty strings
      metrics.communication += Math.min(wordCount / 30, 1) * 100; // Normalize to 100%
      
      // Technical score based on technical terms used
      const technicalTerms = ['algorithm', 'framework', 'database', 'function', 'component', 'system', 'design', 'architecture', 'code', 'test'];
      const technicalTermCount = technicalTerms.reduce((count, term) => {
        return count + (answer.toLowerCase().includes(term) ? 1 : 0);
      }, 0);
      metrics.technical += (technicalTermCount / 3) * 100; // Normalize
      
      // Problem solving based on structure indicators
      const problemSolvingTerms = ['analyze', 'solution', 'approach', 'method', 'implemented', 'resolved', 'improved', 'optimized'];
      const problemSolvingCount = problemSolvingTerms.reduce((count, term) => {
        return count + (answer.toLowerCase().includes(term) ? 1 : 0);
      }, 0);
      metrics.problemSolving += (problemSolvingCount / 2) * 100; // Normalize
    });
    
    // Ensure we have questions to divide by
    const questionCount = Math.max(1, questions.length); // Avoid division by zero
    
    // Average the scores across all questions and ensure they're capped at 100
    metrics.communication = Math.min(Math.round(metrics.communication / questionCount), 100);
    metrics.technical = Math.min(Math.round(metrics.technical / questionCount), 100);
    metrics.problemSolving = Math.min(Math.round(metrics.problemSolving / questionCount), 100);
    
    // Calculate overall score (weighted average)
    metrics.overall = Math.round(
      (metrics.communication * 0.3) + 
      (metrics.technical * 0.4) + 
      (metrics.problemSolving * 0.3)
    );
    
    return metrics;
  };

  const { strengths, improvements } = extractKeyPoints(round?.summary || '');

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                  {round?.name} Round Summary
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Tab navigation */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex">
                  <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 ${
                      activeTab === 'overview'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } transition-colors`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 ${
                      activeTab === 'questions'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } transition-colors`}
                    onClick={() => setActiveTab('questions')}
                  >
                    Questions & Answers
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 ${
                      activeTab === 'feedback'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } transition-colors`}
                    onClick={() => setActiveTab('feedback')}
                  >
                    Performance Analysis
                  </button>
                </div>
              </div>
              
              {/* Tab content */}
              <div className="min-h-[300px] max-h-[60vh] overflow-y-auto pr-2">
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                   {round?.summary ? (
                      <div className="text-gray-700 prose prose-indigo max-w-none">
                        <ReactMarkdown>
                          {round.summary}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500">No summary available for this round</p>
                      </div>
                    )}
                    
                    {/* Key insights section */}
                    {(strengths.length > 0 || improvements.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {/* Strengths */}
                        {strengths.length > 0 && (
                          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <h4 className="font-medium text-green-900 flex items-center mb-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Key Strengths
                            </h4>
                            <ul className="space-y-2">
                              {strengths.map((strength, index) => (
                                <li key={index} className="flex items-start">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                  </svg>
                                  <div className="text-sm text-gray-700 prose prose-sm">
                                    <ReactMarkdown>{strength}</ReactMarkdown>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Areas to improve */}
                        {improvements.length > 0 && (
                          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                            <h4 className="font-medium text-amber-900 flex items-center mb-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                              Areas to Improve
                            </h4>
                            <ul className="space-y-2">
                              {improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                  </svg>
                                  <div className="text-sm text-gray-700 prose prose-sm">
                                    <ReactMarkdown>{improvement}</ReactMarkdown>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'questions' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {loading ? (
                      <div className="py-12 flex justify-center">
                        <LoadingSpinner />
                      </div>
                    ) : questions && questions.length > 0 ? (
                      <div className="space-y-6">
                        {questions.map((qa, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="mb-3">
                              <div className="flex">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 mb-1">Question {index + 1}</div>
                                  <p className="text-gray-700">{qa.question}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="pl-11">
                              <div className="flex">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 mb-1">Your Answer</div>
                                  <p className="text-gray-700">{qa.answer || 'No answer provided'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500">No questions and answers available</p>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'feedback' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Performance metrics */}
                    {questions && questions.length > 0 ? (
                      <div className="space-y-6">
                        {(() => {
                          const metrics = calculatePerformanceMetrics();
                          
                          return (
                            <>
                              {/* Communication Skills */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Communication Skills</h4>
                                <div className="flex items-center mb-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${metrics.communication}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 w-10">{metrics.communication}%</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {metrics.communication > 80 
                                    ? 'Your communication was excellent. You articulated your thoughts clearly and concisely.'
                                    : metrics.communication > 60
                                    ? 'Your communication was good. You expressed your ideas well, but could be more structured in some responses.'
                                    : 'Your communication needs improvement. Focus on organizing your thoughts and expressing them clearly.'}
                                </p>
                              </div>
                              
                              {/* Technical Knowledge */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Technical Knowledge</h4>
                                <div className="flex items-center mb-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${metrics.technical}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 w-10">{metrics.technical}%</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {metrics.technical > 80 
                                    ? 'You demonstrated excellent technical knowledge and depth in your responses.'
                                    : metrics.technical > 60
                                    ? 'You showed good technical understanding. Consider deepening your knowledge in some areas.'
                                    : 'Focus on strengthening your technical understanding and using more precise terminology.'}
                                </p>
                              </div>
                              
                              {/* Problem Solving */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Problem Solving</h4>
                                <div className="flex items-center mb-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${metrics.problemSolving}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 w-10">{metrics.problemSolving}%</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {metrics.problemSolving > 80 
                                    ? 'Your problem-solving approach was methodical and effective. You broke down complex challenges well.'
                                    : metrics.problemSolving > 60
                                    ? 'You showed good problem-solving abilities. Try to be more systematic in your approach.'
                                    : 'Work on developing a more structured approach to problem-solving in your responses.'}
                                </p>
                              </div>
                              
                              {/* Overall Performance */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Overall Performance</h4>
                                <div className="flex items-center mb-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${metrics.overall}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 w-10">{metrics.overall}%</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {metrics.overall > 80 
                                    ? 'Your overall performance was excellent. You demonstrated strong skills across all areas.'
                                    : metrics.overall > 60
                                    ? 'Your overall performance was good. With some targeted improvements, you should do well in real interviews.'
                                    : 'Your interview skills need further development. Focus on the areas highlighted above.'}
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500">No performance data available</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              
              {/* Modal footer */}
              <div className="mt-6 flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={handlePracticeAgain}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Practice Again
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RoundSummaryModal;