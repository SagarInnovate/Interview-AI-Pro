import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { spaceService } from '../services/api';

// Components
import Navbar from '../components/Navbar';
import SpaceCard from '../components/SpaceCard';
import CreateSpaceModal from '../components/CreateSpaceModal';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { currentUser } = useAuth();

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
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const response = await spaceService.getSpaces();
      setSpaces(response.data.spaces || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      toast.error('Failed to load your interview spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = async (newSpace) => {
    try {
      setShowCreateModal(false);
      setLoading(true);
      
      // Create FormData object for file upload
      const formData = new FormData();
      Object.keys(newSpace).forEach(key => {
        if (key === 'resume') {
          formData.append('resume', newSpace.resume);
        } else if (key === 'interviewRounds' && Array.isArray(newSpace.interviewRounds)) {
          newSpace.interviewRounds.forEach(round => {
            formData.append('interviewRounds', round);
          });
        } else {
          formData.append(key, newSpace[key]);
        }
      });
      
      await spaceService.createSpace(formData);
      toast.success('Interview space created successfully!');
      fetchSpaces();
    } catch (error) {
      console.error('Error creating space:', error);
      toast.error('Failed to create interview space');
      setLoading(false);
    }
  };

  // Stats calculation
  const completedInterviews = spaces.reduce((total, space) => {
    return total + (space.interviewRounds?.filter(round => round.status === 'completed')?.length || 0);
  }, 0);

  const pendingRounds = spaces.reduce((total, space) => {
    return total + (space.interviewRounds?.filter(round => round.status !== 'completed')?.length || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {currentUser?.name || 'User'}</h2>
              <p className="text-gray-600">Track your interview preparation and practice sessions.</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm flex items-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Interview Space
            </button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Completed Interviews */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{completedInterviews}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          {/* Pending Rounds */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Rounds</p>
                <p className="text-3xl font-bold text-gray-900">{pendingRounds}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          {/* Active Spaces */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Spaces</p>
                <p className="text-3xl font-bold text-gray-900">{spaces.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Interview Spaces Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Your Interview Spaces</h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {spaces.length > 0 ? (
                spaces.map((space) => (
                  <motion.div key={space._id} variants={cardVariants}>
                    <SpaceCard space={space} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">No Interview Spaces Yet</h4>
                  <p className="text-gray-600 mb-6">Create your first interview space to start practicing</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-colors"
                  >
                    Create Your First Space
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 mt-auto border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">&copy; 2025 InterviewAI Pro. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Help</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Create Space Modal */}
      <CreateSpaceModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSpace}
      />
    </div>
  );
};

export default Dashboard;