const Session = require('../models/sessionModel');
const crypto = require('crypto');

// Create a new session
exports.createSession = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    
    // Generate a unique ID (8 characters)
    const uniqueId = crypto.randomBytes(4).toString('hex');
    
    // Create new session
    const session = await Session.create({
      uniqueId,
      name,
      spaces: []
    });
    
    // Store in session cookie
    req.session.uniqueId = uniqueId;
    req.session.name = name;
    
    // Return success with uniqueId
    res.status(201).json({
      success: true,
      uniqueId,
      name,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating session. Please try again.'
    });
  }
};

// Find and continue with existing session
exports.findSession = async (req, res) => {
  try {
    const { uniqueId } = req.body;
    
    if (!uniqueId || uniqueId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    // Find the session
    const session = await Session.findOne({ uniqueId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found. Please check your ID.'
      });
    }
    
    // Update last active time
    session.lastActive = Date.now();
    await session.save();
    
    // Store in session cookie
    req.session.uniqueId = uniqueId;
    req.session.name = session.name;
    
    // Return success
    res.status(200).json({
      success: true,
      name: session.name,
      message: 'Session found successfully'
    });
  } catch (error) {
    console.error('Error finding session:', error);
    res.status(500).json({
      success: false,
      message: 'Error accessing session. Please try again.'
    });
  }
};

// Get profile info
exports.getProfile = async (req, res) => {
  try {
    const session = await Session.findOne({ uniqueId: req.session.uniqueId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        name: session.name,
      },
      sessionId: session.uniqueId
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    
    const session = await Session.findOneAndUpdate(
      { uniqueId: req.session.uniqueId },
      { name },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Update session cookie
    req.session.name = name;
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// End session
exports.endSession = (req, res) => {
  req.session = null; // Clear the session
  res.status(200).json({
    success: true,
    message: 'Session ended successfully'
  });
};