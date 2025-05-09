import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { interviewService } from '../services/api';

// Technical terms dictionary to help with speech recognition
const technicalTerms = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  react: "React",
  "node js": "Node.js",
  nodejs: "Node.js",
  sequel: "SQL",
  "my sequel": "MySQL",
  "post gress": "PostgreSQL",
  "mongo db": "MongoDB",
  docker: "Docker",
  kubernetes: "Kubernetes",
  kubernetes: "K8s",
  angler: "Angular",
  "view js": "Vue.js",
  lambda: "Lambda",
  "c sharp": "C#",
  "see sharp": "C#",
  rest: "REST",
  api: "API",
  apis: "APIs",
  json: "JSON",
  html: "HTML",
  css: "CSS",
  aws: "AWS",
  azure: "Azure",
  linux: "Linux",
  unix: "Unix",
  github: "GitHub",
  git: "Git",
  devops: "DevOps",
  "ci cd": "CI/CD",
  "front end": "frontend",
  "back end": "backend",
  "type script": "TypeScript",
};

const InterviewScreen = () => {
  const { spaceId, roundName } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing interview environment...');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEdit, setShowEdit] = useState(true);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioDestinationRef = useRef(null);
  const recognitionPausedRef = useRef(false);
  const currentTranscriptRef = useRef('');
  
  // Initialize the interview
  useEffect(() => {
    animateLoading();
    initializeCamera();
    checkSpeechRecognitionSupport();
    fetchQuestions();
    
    // Clean up when component unmounts
    return () => {
      cleanupResources();
    };
  }, []);
  
  // Update word count when current answer changes
  useEffect(() => {
    updateWordCount(currentAnswer);
  }, [currentAnswer]);
  
  // Animate loading bar
  const animateLoading = () => {
    const messages = [
      "Initializing interview environment...",
      "Preparing interview questions...",
      "Setting up voice recognition...",
      "Configuring video connection...",
      "Almost ready...",
    ];
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setLoadingProgress(progress);
      
      if (progress % 20 === 0) {
        const messageIndex = Math.floor(progress / 20) - 1;
        if (messageIndex < messages.length) {
          setLoadingMessage(messages[messageIndex]);
        }
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        // Only close loading if questions have loaded
        if (questionsLoaded) {
          setTimeout(() => {
            setLoading(false);
          }, 500);
        }
      }
    }, 50);
  };
  
  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      const response = await interviewService.generateQuestions(spaceId, roundName);
      if (response.data.success && response.data.questions) {
        setQuestions(response.data.questions);
        
        // Initialize answers object
        const initialAnswers = {};
        response.data.questions.forEach(q => {
          initialAnswers[q] = '';
        });
        setAnswers(initialAnswers);
        
        // Mark questions as loaded
        setQuestionsLoaded(true);
        
        // Show first question and close loading overlay
        setTimeout(() => {
          setLoading(false);
          setTimeout(() => {
            showQuestion(0);
          }, 500);
        }, 1000);
      } else {
        toast.error('Failed to generate interview questions');
        navigate(`/space/${spaceId}`);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to initialize interview. Please try again.');
      navigate(`/space/${spaceId}`);
    }
  };
  
  // Initialize camera
  const initializeCamera = async () => {
    try {
      // Initialize audio context first
      await initializeAudioContext();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Connect the audio to the destination but don't output it to speakers
      if (stream.getAudioTracks().length > 0 && audioContextRef.current) {
        const audioSource = audioContextRef.current.createMediaStreamSource(stream);
        audioSource.connect(audioDestinationRef.current);
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute to prevent feedback
      }
      mediaStreamRef.current = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.warning('Could not access camera. You can still proceed with the interview.');
    }
  };
  
  // Initialize audio context
  const initializeAudioContext = async () => {
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    }
  };
  
  // Check if speech recognition is supported
  const checkSpeechRecognitionSupport = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.warning('Your browser does not support speech recognition. You can answer manually using the edit button.');
      return false;
    }
    
    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onstart = handleRecognitionStart;
    recognitionRef.current.onresult = handleRecognitionResult;
    recognitionRef.current.onerror = handleRecognitionError;
    recognitionRef.current.onend = handleRecognitionEnd;
    
    // Start recognition automatically every 5 seconds to avoid timeout
    setInterval(() => {
      if (isRecording) {
        recognitionPausedRef.current = true;
        recognitionRef.current.stop();
      }
    }, 5000);
    
    return true;
  };
  
  // Handle recognition start
  const handleRecognitionStart = () => {
    setIsRecording(true);
    // We DON'T reset currentTranscriptRef here, which preserves previous text
  };
  
  // Handle recognition result
  const handleRecognitionResult = (event) => {
    // Start from what we already have in the transcript
    let finalTranscript = currentTranscriptRef.current;
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      let transcript = result[0].transcript;
      
      // Apply technical term corrections
      for (const [incorrect, correct] of Object.entries(technicalTerms)) {
        const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
        transcript = transcript.replace(regex, correct);
      }
      
      if (result.isFinal) {
        // Append to the final transcript with a space if needed
        finalTranscript += (finalTranscript && !finalTranscript.endsWith(' ') ? ' ' : '') + transcript.trim();
        // Update our reference for next recognition
        currentTranscriptRef.current = finalTranscript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Update the answer with final and interim results
    setCurrentAnswer(finalTranscript + (interimTranscript ? ` ${interimTranscript}` : ''));
  };
  
  // Handle recognition error
  const handleRecognitionError = (event) => {
    console.error('Speech recognition error:', event);
    
    if (event.error === 'no-speech') {
      // Don't stop for no-speech errors
      return;
    }
    
    setIsRecording(false);
    
    if (event.error === 'not-allowed') {
      toast.error('Microphone access denied. Please check your browser permissions.');
    }
  };
  
  // Handle recognition end
  const handleRecognitionEnd = () => {
    if (recognitionPausedRef.current) {
      // If paused (not a real end), restart recognition
      recognitionPausedRef.current = false;
      recognitionRef.current.start();
    } else {
      setIsRecording(false);
    }
  };
  
  // Show question and speak it
  const showQuestion = (index) => {
    if (!questions || questions.length === 0 || index >= questions.length) {
      return;
    }
    
    // Stop any previous speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Use Text-to-Speech with improved voice settings
    utteranceRef.current = new SpeechSynthesisUtterance(questions[index]);
    setIsSpeaking(true);
    
    // Improve voice settings
    utteranceRef.current.rate = 0.9;
    utteranceRef.current.pitch = 1.1;
    
    // Try to get a better voice if available
    if (window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = [
        'Google UK English Male',
        'Microsoft Mark - English (United States)',
        'Alex',
        'Daniel'
      ];
      
      // Find a preferred voice if available
      for (const preferredVoice of preferredVoices) {
        const voice = voices.find(v => v.name === preferredVoice);
        if (voice) {
          utteranceRef.current.voice = voice;
          break;
        }
      }
      
      // When speech synthesis ends, auto-start listening
      utteranceRef.current.onend = () => {
        setIsSpeaking(false);
        
        // Show "Speak now" notification
        toast.info(
          <div className="flex items-center">
            <i className="fas fa-microphone mr-2"></i>
            <span>Speak now...</span>
          </div>,
          { autoClose: 3000 }
        );
        
        setTimeout(() => {
          // Reset the current transcript before starting a new recording
          // but only if we're on a new question
          if (currentAnswer === '') {
            currentTranscriptRef.current = '';
          }
          startSpeaking();
        }, 1000);
      };
      
      window.speechSynthesis.speak(utteranceRef.current);
    }
  };
  
  // Stop question speaking
  const stopQuestionSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Replay current question
  const replayQuestion = () => {
    showQuestion(currentQuestionIndex);
  };
  
  // Start speaking/recording
  const startSpeaking = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };
  
  // Stop speaking/recording
  const stopSpeaking = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };
  
  // Update word count
  const updateWordCount = (text) => {
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(count);
  };
  
  // Save answer and go to next question
  const saveAnswerAndNext = () => {
    // Save current answer
    const question = questions[currentQuestionIndex];
    
    setAnswers(prev => ({
      ...prev,
      [question]: currentAnswer
    }));
    
    // Reset current transcript reference for next question
    currentTranscriptRef.current = '';
    
    // Check if there are more questions
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      
      // Show next question with a slight delay
      setTimeout(() => {
        showQuestion(currentQuestionIndex + 1);
      }, 300);
    } else {
      // All questions answered, finish interview
      finishInterview();
    }
  };
  
  // Enable editing mode
  const enableEditing = () => {
    setShowEdit(false);
  };
  
  // Update answer manually
  const handleAnswerChange = (e) => {
    setCurrentAnswer(e.target.value);
    currentTranscriptRef.current = e.target.value; // Update reference too
  };
  
  // Finish interview and submit answers
  const finishInterview = async () => {
    setIsSubmitting(true);
    cleanupResources();
    
    try {
      // Filter out empty answers
      const filteredAnswers = {};
      Object.keys(answers).forEach(question => {
        const answer = question === questions[currentQuestionIndex] 
          ? currentAnswer 
          : answers[question];
          
        if (answer && answer.trim()) {
          filteredAnswers[question] = answer;
        }
      });
      
      if (Object.keys(filteredAnswers).length === 0) {
        toast.warning('Please answer at least one question before finishing.');
        setIsSubmitting(false);
        return;
      }
      
      const response = await interviewService.finishRound(spaceId, roundName, filteredAnswers);
      
      if (response.data.success) {
        toast.success('Interview completed successfully!');
        navigate(`/space/${spaceId}`);
      } else {
        toast.error('Failed to submit interview answers. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error finishing interview:', error);
      toast.error('Failed to submit interview answers. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Clean up resources
  const cleanupResources = () => {
    // Stop all tracks from the media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Stop speech recognition if active
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    
    // Stop speech synthesis if active
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Close audio context if it exists
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(err => console.error('Error closing audio context:', err));
    }
  };
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!questions || questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };
  
  // Is this the last question?
  const isLastQuestion = () => {
    return currentQuestionIndex === questions.length - 1;
  };
  
  // Loading screen JSX
  const renderLoadingScreen = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
      <div className="text-center px-6 py-8 rounded-xl bg-white shadow-2xl transform transition-transform duration-500 scale-100">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isSubmitting ? 'Finalizing Your Interview' : 'Preparing Your Interview'}
          </h2>
          <p className="text-gray-600 mb-6">
            {loadingMessage}
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-500">
            {isSubmitting ? 'Processing your responses...' : 'Initializing interview environment...'}
          </p>
        </div>
      </div>
    </div>
  );
  
  // Main interview screen JSX
  const renderInterviewScreen = () => (
    <div className="container mx-auto px-4 py-8 max-w-7xl fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            {roundName} Interview Session
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 text-sm font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full progress-value"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Question card */}
          <div className="bg-white rounded-xl shadow-lg p-6 slide-in">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <i className="fas fa-question text-blue-600"></i>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Current Question
                  </h2>
                </div>
                <div className="text-gray-700 leading-relaxed py-2 border-l-4 border-blue-500 pl-4">
                  {questions[currentQuestionIndex] || 'Loading question...'}
                </div>
              </div>
              {/* Question control button - single button that changes function */}
              <div className="flex space-x-2">
                <button
                  onClick={isSpeaking ? stopQuestionSpeaking : replayQuestion}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                  title={isSpeaking ? "Stop Audio" : "Replay Question"}
                >
                  <i className={`fas ${isSpeaking ? 'fa-volume-mute' : 'fa-redo-alt'}`}></i>
                </button>
              </div>
            </div>
          </div>

          {/* Video section */}
          <div className="bg-white rounded-xl shadow-lg p-6 slide-in">
            <div className="camera-container rounded-lg overflow-hidden relative aspect-video bg-gray-900">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              ></video>
              <div className="camera-overlay"></div>

              {/* Technical quality indicators */}
              <div className="absolute top-4 left-4 flex space-x-2">
                <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <i className="fas fa-signal mr-1 text-green-400"></i>
                  <span>HD</span>
                </div>
                <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <i className="fas fa-microphone mr-1 text-green-400"></i>
                  <span>Clear</span>
                </div>
              </div>

              {/* Virtual interviewer indicator */}
              <div className={`absolute bottom-4 left-4 bg-blue-600 rounded-full p-3 flex items-center justify-center shadow-lg ${isSpeaking ? 'pulse-animation' : ''}`}>
                <div className="relative">
                  <i className="fas fa-user-tie text-white text-lg"></i>
                  <div className="wave-animation wave-1 inset-0 absolute bg-blue-500"></div>
                  <div className="wave-animation wave-2 inset-0 absolute bg-blue-500"></div>
                  <div className="wave-animation wave-3 inset-0 absolute bg-blue-500"></div>
                </div>
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500 bg-opacity-80 text-white text-xs px-3 py-1 rounded-full flex items-center">
                  <div className="w-2 h-2 bg-red-100 rounded-full pulse-animation mr-1"></div>
                  <span>REC</span>
                </div>
              )}

              {/* Virtual backgrounds option */}
              <div className="absolute bottom-4 right-4">
                <button className="bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full hover:bg-opacity-70 transition-all">
                  <i className="fas fa-image mr-1"></i>
                  <span>Backgrounds</span>
                </button>
              </div>
            </div>

            {/* Controls section */}
            <div className="flex items-center justify-center space-x-4 mt-6">
              {/* Mic button (shown when not recording) */}
              {!isRecording ? (
                <button
                  onClick={startSpeaking}
                  className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all focus:outline-none"
                  disabled={isRecording || isSpeaking}
                >
                  <i className="fas fa-microphone text-lg"></i>
                </button>
              ) : (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center justify-center w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all focus:outline-none"
                >
                  <i className="fas fa-microphone-slash text-lg"></i>
                </button>
              )}

              {/* Next button (always visible) */}
              <button
                onClick={saveAnswerAndNext}
                className="flex items-center justify-center w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all focus:outline-none"
                disabled={isRecording || isSpeaking}
              >
                <i className={isLastQuestion() ? "fas fa-check" : "fas fa-arrow-right"} title={isLastQuestion() ? "End Interview" : "Next Question"}></i>
              </button>
            </div>

            {/* Status indicators */}
            <div className="flex justify-center mt-3">
              {isRecording && (
                <div className="flex items-center text-sm font-medium text-blue-600">
                  <span className="mr-2">Listening</span>
                  <div className="flex space-x-1">
                    <div className="typing-dot w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    <div className="typing-dot w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    <div className="typing-dot w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              )}
              
              {!isRecording && !isSpeaking && (
                <div className="text-sm text-gray-600">
                  {isLastQuestion() ? "Click 'End Interview' when ready" : "Click 'Next' when ready"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column (2/5) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 h-full slide-in">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <i className="fas fa-comment-alt text-green-600"></i>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Your Response</h2>
            </div>

            {/* Transcript area */}
            <div className="relative h-[calc(100%-4rem)]">
              <textarea
                className="w-full h-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg resize-none custom-scrollbar"
                placeholder="Your answer will appear here as you speak..."
                value={currentAnswer}
                onChange={handleAnswerChange}
                disabled={isRecording}
              ></textarea>

              {/* Word/character counter */}
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                <span>{wordCount}</span> words
              </div>

              {showEdit && !isRecording && (
                <div className="absolute bottom-3 left-3 text-xs">
                  <button
                    onClick={enableEditing}
                    className="flex items-center space-x-1 text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <i className="fas fa-edit"></i>
                    <span>Edit</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interview tips/feedback section */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6 slide-in">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <i className="fas fa-lightbulb text-indigo-600"></i>
          </div>
          <h3 className="text-base font-semibold text-gray-800">Interview Tips</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Speak clearly:</span> Articulate
              technical terms carefully for better recognition.
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Structure:</span> Use STAR method
              (Situation, Task, Action, Result) for responses.
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Concise:</span> Keep answers focused and
              avoid going off-topic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen font-['Inter',sans-serif] bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with exit button */}
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{roundName} Interview</h1>
          <button 
            onClick={() => navigate(`/space/${spaceId}`)} 
            className="text-gray-500 hover:text-gray-700"
            title="Exit Interview"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
      </header>
      
      {/* Main content */}
      {(loading || isSubmitting) ? renderLoadingScreen() : renderInterviewScreen()}
      
      {/* Custom Styles - Adding directly for compatibility */}
      <style jsx="true">{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        .pulse-animation {
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .wave-animation {
          position: absolute;
          border-radius: 50%;
          animation: wave 2s infinite;
          opacity: 0;
        }

        .wave-1 {
          animation-delay: 0s;
        }

        .wave-2 {
          animation-delay: 0.6s;
        }

        .wave-3 {
          animation-delay: 1.2s;
        }

        @keyframes wave {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Progress bar animation */
        .progress-value {
          transition: width 0.4s ease;
        }

        /* Improved scrollbar for the transcript */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Camera filters */
        .camera-container {
          position: relative;
        }

        .camera-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.2);
          border-radius: 1rem;
        }
        
        /* Aspect ratio support for video container */
        .aspect-video {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
        }
        
        .aspect-video video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        /* Typing indicator animation */
        @keyframes typing {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }

        .typing-dot:nth-child(1) {
          animation: typing 1.4s infinite 0s;
        }
        .typing-dot:nth-child(2) {
          animation: typing 1.4s infinite 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation: typing 1.4s infinite 0.4s;
        }
      `}</style>
    </div>
  );
};

export default InterviewScreen;