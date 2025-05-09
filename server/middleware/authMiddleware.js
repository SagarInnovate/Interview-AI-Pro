// Middleware to protect routes
const protect = (req, res, next) => {
    if (!req.session.uniqueId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please log in'
      });
    }
    next();
  };
  
  // Middleware to check if the requested Space belongs to the user
  const checkSpaceOwnership = async (req, res, next) => {
    try {
      const Space = require('../models/spaceModel');
      const spaceId = req.params.id || req.params.spaceId;
      
      const space = await Space.findById(spaceId);
      
      if (!space) {
        return res.status(404).json({
          success: false,
          message: 'Space not found'
        });
      }
      
      if (space.studentId !== req.session.uniqueId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this space'
        });
      }
      
      req.space = space;
      next();
    } catch (error) {
      console.error('Error in checkSpaceOwnership middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  module.exports = { protect, checkSpaceOwnership };