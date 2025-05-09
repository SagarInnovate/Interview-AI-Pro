const Space = require('../models/spaceModel');
const Session = require('../models/sessionModel');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const marked = require('marked');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to extract text from PDF
const extractTextFromPDF = async (filePath) => {
  const pdfBuffer = await fs.promises.readFile(filePath);
  const data = await pdfParse(pdfBuffer);
  return data.text;
};

// Function to extract text from DOCX
const extractTextFromDOCX = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
};

// Function to generate a purified summary using Gemini AI
// Function to generate a purified summary using Gemini AI
const purifyContent = async (resumeText, jobDescription) => {
  try {
    let prompt;
    
    if (jobDescription && jobDescription.trim().length > 20) {
      prompt = `
      You're an AI assistant helping to summarize resume content for a job application.

      Resume text:
      """
      ${resumeText.substring(0, 3000)}
      """

      Job description:
      """
      ${jobDescription.substring(0, 1000)}
      """

      Your task: Analyze this resume and identify the most relevant skills, experiences, and qualifications that match this job description. Create a concise, professional summary highlighting the candidate's strengths for this specific role. Format your response as a well-structured paragraph. Do not include phrases like "Based on the resume" or "According to the job description" - just provide the direct summary.
      `;
    } else {
      prompt = `
      You're an AI assistant helping to summarize resume content.

      Resume text:
      """
      ${resumeText.substring(0, 3000)}
      """

      Your task: Analyze this resume and create a concise, professional summary highlighting the candidate's key skills, experiences, and qualifications. Format your response as a well-structured paragraph focusing on their strengths and achievements. Do not include phrases like "Based on the resume" - just provide the direct summary.
      `;
    }
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error summarizing content:', error);
    return 'There was an error generating the resume summary. Please try uploading your resume again.';
  }
};

// Create a new interview space
exports.createSpace = async (req, res) => {
  try {
    const { companyName, jobPosition, interviewRounds, jobDescription } = req.body;
    
    // Validate required fields
    if (!companyName || !jobPosition || !interviewRounds || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Company name, job position, interview rounds, and resume are required.'
      });
    }
    
    // Fix for single round selection - ensure it's always an array
    const rounds = Array.isArray(interviewRounds) 
      ? interviewRounds 
      : interviewRounds ? [interviewRounds] : [];
    
    if (rounds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one interview round is required.'
      });
    }
    
    // Resume processing
    const resumePath = req.file.path;
    const fileName = req.file.filename;
    
    let resumeText = '';
    if (path.extname(resumePath).toLowerCase() === '.pdf') {
      resumeText = await extractTextFromPDF(resumePath);
    } else if (path.extname(resumePath).toLowerCase() === '.docx') {
      resumeText = await extractTextFromDOCX(resumePath);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Only PDF and DOCX file types are supported.'
      });
    }
    
    const isJobDescriptionValid = jobDescription && jobDescription.trim().length > 20;
    const purifiedSummary = await purifyContent(resumeText, isJobDescriptionValid ? jobDescription : '');
    
    // Create new space
    const newSpace = new Space({
      studentId: req.session.uniqueId,
      companyName,
      jobPosition,
      interviewRounds: rounds.map((round) => ({ name: round })),
      jobDescription: isJobDescriptionValid ? jobDescription : 'N/A',
      resumePath: fileName,
      resumeText,
      purifiedSummary,
    });
    
    await newSpace.save();
    
    // Update session's spaces array
    await Session.findOneAndUpdate(
      { uniqueId: req.session.uniqueId },
      { $push: { spaces: newSpace._id } }
    );
    
    res.status(201).json({
      success: true,
      spaceId: newSpace._id,
      message: 'Interview space created successfully'
    });
  } catch (error) {
    console.error('Error creating space:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating space. Please try again.'
    });
  }
};

// Get all spaces for a session
exports.getSpaces = async (req, res) => {
  try {
    const spaces = await Space.find({ studentId: req.session.uniqueId });
    
    res.status(200).json({
      success: true,
      spaces
    });
  } catch (error) {
    console.error('Error fetching spaces:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching spaces. Please try again.'
    });
  }
};

// Get space details
exports.getSpaceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch the space
    const space = await Space.findById(id);
    
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found.'
      });
    }
    
    // Verify owner
    if (space.studentId !== req.session.uniqueId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this space.'
      });
    }
    
    // Set up DOMPurify for server-side sanitization
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window);
    
    // Sanitize and parse markdown for different fields
    if (space.jobDescription && space.jobDescription !== 'N/A') {
      space.jobDescription = DOMPurify.sanitize(marked.parse(space.jobDescription));
    }
    
    if (space.purifiedSummary) {
      space.purifiedSummary = DOMPurify.sanitize(marked.parse(space.purifiedSummary));
    }
    
    // Process interview rounds
    if (space.interviewRounds && space.interviewRounds.length > 0) {
      space.interviewRounds = space.interviewRounds.map(round => {
        // Only process summary if it exists and the round is not 'not completed'
        if (round.summary && round.status !== 'not completed') {
          // Convert summary to HTML and sanitize
          round.summaryHTML = DOMPurify.sanitize(marked.parse(round.summary));
        }
        return round;
      });
    }
    
    res.status(200).json({
      success: true,
      space
    });
  } catch (error) {
    console.error('Error fetching space details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching space details. Please try again.'
    });
  }
};

// Download resume
exports.downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the space to get the resume path
    const space = await Space.findById(id);
    
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }
    
    // Verify owner
    if (space.studentId !== req.session.uniqueId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resume'
      });
    }
    
    const filePath = path.resolve(path.join(__dirname, '../../public/Resumes', space.resumePath));
    
    // Security check to prevent directory traversal
    if (!filePath.startsWith(path.resolve(path.join(__dirname, '../../public/Resumes')))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found'
      });
    }
    
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        return res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });
  } catch (error) {
    console.error('Error in download route:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing download request'
    });
  }
};