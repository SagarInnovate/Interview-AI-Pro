const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const spaceController = require('../controllers/spaceController');
const interviewController = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure 'Resumes' folder exists
const resumeFolderPath = path.join(__dirname, '../../public/Resumes');
if (!fs.existsSync(resumeFolderPath)) {
  fs.mkdirSync(resumeFolderPath, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumeFolderPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('File upload only supports PDF, DOC, and DOCX formats'));
  }
});

// Session routes
router.post('/session/start-new', sessionController.createSession);
router.post('/session/continue', sessionController.findSession);
router.get('/session/profile', protect, sessionController.getProfile);
router.post('/session/update-profile', protect, sessionController.updateProfile);
router.get('/session/end', sessionController.endSession);

// Space routes
router.get('/spaces', protect, spaceController.getSpaces);
router.post('/spaces/create', [protect, upload.single('resume')], spaceController.createSpace);
router.get('/spaces/:id', protect, spaceController.getSpaceDetails);
router.get('/spaces/resume/:id', protect, spaceController.downloadResume);

// Interview routes
router.get('/interview/:spaceId/:roundName/generate-questions', protect, interviewController.startRound);
router.post('/interview/:spaceId/:roundName/finish', protect, interviewController.finishRound);
router.get('/interview/questions-answers/:roundId', protect, interviewController.getQuestionsAnswers);

module.exports = router;