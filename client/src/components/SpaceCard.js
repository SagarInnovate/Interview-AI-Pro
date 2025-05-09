import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SpaceCard = ({ space }) => {
  // Calculate progress
  const totalRounds = space.interviewRounds?.length || 0;
  const completedRounds = space.interviewRounds?.filter(round => round.status === 'completed')?.length || 0;
  const progressPercentage = totalRounds > 0 ? Math.round((completedRounds / totalRounds) * 100) : 0;

  // Get round status icon and color
  const getRoundStatusDetails = (status) => {
    switch (status) {
      case 'completed':
        return { 
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>, 
          color: 'bg-green-100 text-green-700 border-green-200' 
        };
      case 'in_progress':
        return { 
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>, 
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200' 
        };
      default:
        return { 
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>, 
          color: 'bg-gray-100 text-gray-700 border-gray-200' 
        };
    }
  };

  // Get icon for round type
  const getRoundIcon = (roundName) => {
    const name = roundName.toLowerCase();
    if (name.includes('hr')) {
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>;
    } else if (name.includes('tech')) {
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>;
    } else if (name.includes('design')) {
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>;
    } else if (name.includes('behavior')) {
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>;
    } else if (name.includes('case')) {
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>;
    } else if (name.includes('final')) {
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>;
    } else {
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>;
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Card header with company details */}
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 flex flex-col justify-end">
          <h4 className="text-lg font-semibold text-gray-900 truncate">{space.jobPosition}</h4>
          <p className="text-sm text-gray-600 truncate">{space.companyName}</p>
        </div>
        {/* Badge for round count */}
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-xs text-gray-700 px-2 py-1 rounded-full shadow-sm border border-gray-200">
          {space.interviewRounds?.length || 0} rounds
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Round status indicators */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Interview Rounds:</p>
          <div className="flex flex-wrap gap-1">
            {space.interviewRounds && space.interviewRounds.map((round, index) => {
              const { icon, color } = getRoundStatusDetails(round.status);
              return (
                <div 
                  key={index}
                  className={`inline-flex items-center text-xs px-2 py-1 rounded-full border ${color}`}
                  title={`${round.name} Round: ${round.status}`}
                >
                  <span className="mr-1">{getRoundIcon(round.name)}</span>
                  <span className="flex items-center">
                    {round.name}
                    <span className="ml-1">{icon}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Action button */}
        <div className="flex justify-between items-center">
          <Link to={`/space/${space._id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            View Details
          </Link>
          <Link 
            to={`/space/${space._id}`} 
            className="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition-colors text-indigo-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default SpaceCard;