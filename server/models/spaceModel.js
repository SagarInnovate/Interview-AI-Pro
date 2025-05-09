const mongoose = require('mongoose');

// Schema for interview rounds
const interviewRoundSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'not completed',
    enum: ['not completed', 'in_progress', 'completed'] 
  },
  summary: { 
    type: String, 
    default: '' 
  },
});

// Schema for the space (company)
const spaceSchema = new mongoose.Schema({
  studentId: { 
    type: String,  
    required: true // Stores the uniqueId from session
  },
  companyName: { 
    type: String, 
    required: true,
  },
  jobPosition: { 
    type: String, 
    required: true,
  },
  jobDescription: { 
    type: String, 
    required: true,
  },
  interviewRounds: [interviewRoundSchema], 
  resumePath: { 
    type: String, 
    required: true,
  },
  resumeText: {
    type: String,
    required: true
  },
  purifiedSummary: {
    type: String,
    required: true
  },
}, { timestamps: true });

const Space = mongoose.model('Space', spaceSchema);

module.exports = Space;