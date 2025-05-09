import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        className="max-w-md text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 Text */}
        <motion.div
          className="relative"
          variants={itemVariants}
        >
          <div className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600">
            404
          </div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-600 opacity-10 blur-2xl rounded-full"></div>
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-bold text-gray-900 mt-4 mb-6"
          variants={itemVariants}
        >
          Page Not Found
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-600 mb-8"
          variants={itemVariants}
        >
          Oops! It seems you're lost in the interview universe. The page you're looking for doesn't exist or might have been moved.
        </motion.p>
        
        <motion.div
          className="mb-12"
          variants={itemVariants}
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transform transition-transform hover:scale-105 duration-300">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <p className="text-gray-700 mb-6">
              Even our AI interviewer can't find this page!
            </p>
            
            <Link 
              to="/" 
              className="inline-block bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-colors"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
                </svg>
                Return to Homepage
              </div>
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex justify-center items-center space-x-8"
          variants={itemVariants}
        >
          <Link to="/" className="text-gray-500 hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <span className="text-gray-500">|</span>
          <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
            Contact Support
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;