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
  const [manualInputMode, setManualInputMode] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioDestinationRef = useRef(null);
  const recognitionPausedRef = useRef(false);
  const currentTranscriptRef = useRef('');
  const initializationAttemptedRef = useRef(false);
  
  // Detect mobile devices
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  // Check browser compatibility
  const checkBrowserCompatibility = () => {
    const diagnostics = {
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webAudio: !!(window.AudioContext || window.webkitAudioContext),
      speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition),
      speechSynthesis: !!window.speechSynthesis,
      secure: window.location.protocol === 'https:' || 
              window.location.hostname === 'localhost' ||
              window.location.hostname === '127.0.0.1',
      mobile: isMobileDevice()
    };
    
    console.log('Browser compatibility diagnostics:', diagnostics);
    
    // Log available input devices (helps for debugging)
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          const videoInputs = devices.filter(device => device.kind === 'videoinput');
          
          console.log('Available audio inputs:', audioInputs.length);
          console.log('Available video inputs:', videoInputs.length);
          
          // Show a warning if no devices found
          if (audioInputs.length === 0) {
            toast.warning('No microphone detected. Please enable manual input mode.');
            setManualInputMode(true);
          }
          if (videoInputs.length === 0) {
            toast.warning('No camera detected. Video will not be available.');
          }
        })
        .catch(error => {
          console.error('Error enumerating devices:', error);
        });
    }
    
    // Check for security context
    if (!diagnostics.secure) {
      toast.error('Media access requires HTTPS. Some features may not work.');
    }
    
    return diagnostics;
  };
  
  // Initialize the interview
  useEffect(() => {
    // Check browser compatibility first
    const diagnostics = checkBrowserCompatibility();
    
    // Set loading indicators
    setLoading(true);
    setLoadingProgress(0);
    setLoadingMessage('Initializing interview environment...');
    
    // Start loading animation
    const cleanupAnimation = animateLoading();
    
    // Create an async function to handle all initializations
    const initialize = async () => {
      try {
        // Initialize in sequence to avoid race conditions
        await fetchQuestions();
        
        // Check if we're in a secure context
        if (diagnostics.secure) {
          // Only initialize media if we haven't yet
          if (!initializationAttemptedRef.current) {
            // Try to initialize camera and microphone
            await initializeMediaDevices();
            initializationAttemptedRef.current = true;
          }
        } else {
          console.warn('Insecure context - skipping media initialization');
          setManualInputMode(true);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        toast.error('There was a problem initializing the interview. Using manual input mode.');
        setManualInputMode(true);
        setMediaError(true);
      }
    };
    
    // Execute initialization
    initialize();
    
    // Clean up when component unmounts
    return () => {
      cleanupAnimation();
      cleanupResources();
    };
  }, []);
  
  // Handle mobile-specific behavior
  useEffect(() => {
    if (isMobileDevice()) {
      console.log('Mobile device detected, applying mobile-specific settings');
      
      // On mobile, we need to handle user interaction to initialize audio context
      const handleUserInteraction = () => {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().then(() => {
            console.log('AudioContext resumed on user interaction');
          }).catch(err => {
            console.error('Error resuming AudioContext:', err);
          });
        }
        
        // Remove the listener after first interaction
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('click', handleUserInteraction);
      };
      
      document.addEventListener('touchstart', handleUserInteraction);
      document.addEventListener('click', handleUserInteraction);
      
      // Return cleanup function
      return () => {
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('click', handleUserInteraction);
      };
    }
  }, []);
  
  // Update word count when current answer changes
  useEffect(() => {
    updateWordCount(currentAnswer);
  }, [currentAnswer]);
  
  // Initialize media devices (camera and microphone)
  const initializeMediaDevices = async () => {
    try {
      await initializeAudioContext();
      await initializeCamera();
      const speechSupported = checkSpeechRecognitionSupport();
      
      if (!speechSupported) {
        toast.warning('Speech recognition not supported. Using manual input mode.');
        setManualInputMode(true);
      }
    } catch (error) {
      console.error('Failed to initialize media devices:', error);
      toast.error('Failed to access media devices. Using manual input mode.');
      setManualInputMode(true);
      setMediaError(true);
    }
  };
  
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
        // Only close loading if questions have loaded
        if (questionsLoaded) {
          setTimeout(() => {
            setLoading(false);
          }, 500);
        }
      }
    }, 50);
    
    // Return a cleanup function
    return () => {
      clearInterval(interval);
    };
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
        
        return true;
      } else {
        toast.error('Failed to generate interview questions');
        navigate(`/space/${spaceId}`);
        return false;
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to initialize interview. Please try again.');
      navigate(`/space/${spaceId}`);
      return false;
    }
  };
  
  // Initialize camera
  const initializeCamera = async () => {
    try {
      // Request camera and microphone permissions with better constraints
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
          // Add framerate constraint to improve performance
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      // Try with standard constraints first
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setupMediaStream(stream);
        return true;
      } catch (error) {
        console.error('Error accessing camera with ideal constraints:', error);
        
        // Try with reduced constraints for mobile devices
        try {
          const mobileConstraints = {
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user"
            },
            audio: true
          };
          const stream = await navigator.mediaDevices.getUserMedia(mobileConstraints);
          setupMediaStream(stream);
          return true;
        } catch (mobileFallbackError) {
          console.error('Error accessing camera with reduced constraints:', mobileFallbackError);
          
          // Try with just audio as last resort
          try {
            const audioOnlyConstraints = { audio: true, video: false };
            const audioStream = await navigator.mediaDevices.getUserMedia(audioOnlyConstraints);
            setupMediaStream(audioStream);
            toast.warning('Camera access failed. Audio-only mode enabled.');
            return true;
          } catch (audioOnlyError) {
            console.error('Error accessing audio-only:', audioOnlyError);
            toast.error('Could not access microphone. Please check browser permissions.');
            throw new Error('Media access failed');
          }
        }
      }
    } catch (error) {
      console.error('General error in camera initialization:', error);
      toast.warning('Media access failed. You can still proceed with the interview and type answers.');
      setManualInputMode(true);
      throw error;
    }
  };
  
  // Helper function to setup the media stream
  const setupMediaStream = (stream) => {
    if (videoRef.current && stream) {
      // Check if we actually have video tracks
      if (stream.getVideoTracks().length > 0) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute to prevent feedback
        
        // Log active video track constraints to help with debugging
        const videoTrack = stream.getVideoTracks()[0];
        console.log('Active video track:', videoTrack.label);
        console.log('Video track settings:', videoTrack.getSettings());
      } else {
        // No video tracks available
        console.log('No video tracks in the stream');
        toast.info('Video unavailable. Running in audio-only mode.');
      }
    } else {
      console.warn('Video reference not available or stream is null');
    }
    
    // Connect the audio to the destination but don't output it to speakers
    if (stream && stream.getAudioTracks().length > 0 && audioContextRef.current) {
      try {
        const audioSource = audioContextRef.current.createMediaStreamSource(stream);
        audioSource.connect(audioDestinationRef.current);
        
        // Log active audio track to help with debugging
        const audioTrack = stream.getAudioTracks()[0];
        console.log('Active audio track:', audioTrack.label);
        console.log('Audio track settings:', audioTrack.getSettings());
      } catch (error) {
        console.error('Error connecting audio source:', error);
      }
    } else {
      console.warn('Either no audio tracks in stream or audio context not available');
    }
    
    mediaStreamRef.current = stream;
  };
  
  // Initialize audio context
  const initializeAudioContext = async () => {
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          console.warn('AudioContext not supported in this browser');
          return false;
        }
        
        audioContextRef.current = new AudioContext();
        
        // Resume the audio context if it's in suspended state
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
        return true;
      } catch (error) {
        console.error('Error initializing audio context:', error);
        return false;
      }
    }
    return true;
  };
  
  // Check if speech recognition is supported
  const checkSpeechRecognitionSupport = () => {
    // Check for various browser implementations
    const SpeechRecognition = window.SpeechRecognition || 
                              window.webkitSpeechRecognition || 
                              window.mozSpeechRecognition || 
                              window.msSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      toast.warning('Your browser does not support speech recognition. You can answer manually using the edit button.');
      return false;
    }
    
    try {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onstart = handleRecognitionStart;
      recognitionRef.current.onresult = handleRecognitionResult;
      recognitionRef.current.onerror = handleRecognitionError;
      recognitionRef.current.onend = handleRecognitionEnd;
      
      return true;
    } catch (error) {
      console.error('Error setting up speech recognition:', error);
      return false;
    }
  };
  
  // Handle recognition start
  const handleRecognitionStart = () => {
    console.log('Recognition started');
    setIsRecording(true);
    // We don't reset currentTranscriptRef here, which preserves previous text
    
    // Set a timeout for recognition reset to avoid browser limitations
    setTimeout(() => {
      if (recognitionRef.current && isRecording) {
        try {
          recognitionPausedRef.current = true;
          recognitionRef.current.stop();
          console.log('Recognition automatically paused due to timeout');
        } catch (error) {
          console.error('Error stopping recognition in timeout:', error);
        }
      }
    }, 10000); // 10 seconds is more reliable than 5
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
    console.error('Speech recognition error:', event.error);
    
    if (event.error === 'no-speech') {
      // Don't display error for no-speech errors
      return;
    }
    
    if (event.error === 'audio-capture') {
      toast.error('Microphone issue detected. Please check your microphone or switch to manual input.');
      setManualInputMode(true);
    } else if (event.error === 'not-allowed') {
      toast.error('Microphone access denied. Please check your browser permissions.');
      setManualInputMode(true);
    } else if (event.error === 'network') {
      toast.warning('Network issue detected. Recognition may be affected.');
    } else if (event.error === 'aborted') {
      // Recognition was aborted, which is normal during restart
      return;
    } else {
      toast.warning(`Speech recognition issue: ${event.error}. You may need to use manual input.`);
    }
  };
  
  // Handle recognition end
  const handleRecognitionEnd = () => {
    console.log('Recognition ended, paused state:', recognitionPausedRef.current);
    
    if (recognitionPausedRef.current) {
      // If paused (not a real end), restart recognition with a slight delay
      recognitionPausedRef.current = false;
      setTimeout(() => {
        try {
          if (recognitionRef.current && !manualInputMode) {
            recognitionRef.current.start();
            console.log('Recognition restarted after pause');
          }
        } catch (error) {
          console.error('Error restarting recognition:', error);
          setIsRecording(false);
          toast.error('Failed to restart speech recognition. You may need to use manual input.');
          setManualInputMode(true);
        }
      }, 300);
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
    try {
      utteranceRef.current = new SpeechSynthesisUtterance(questions[index]);
      setIsSpeaking(true);
      
      // Adjust voice settings for better mobile compatibility
      utteranceRef.current.rate = isMobileDevice() ? 1.0 : 0.9; // Slightly faster on mobile
      utteranceRef.current.pitch = 1.1;
      utteranceRef.current.volume = 1.0; // Ensure full volume
      
      // Get available voices (with a fallback for mobile Safari)
      const getVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          return voices;
        } else {
          return [];
        }
      };
      
      let voices = getVoices();
      
      // If no voices available yet, wait for them to load
      if (voices.length === 0 && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          selectVoice(voices);
        };
      } else {
        selectVoice(voices);
      }
      
      function selectVoice(availableVoices) {
        const preferredVoices = [
          'Google UK English Male',
          'Microsoft Mark - English (United States)',
          'Alex',
          'Daniel',
          'en-US', // Try to match by language code
          'en-GB'
        ];
        
        // Find a preferred voice if available
        let selectedVoice = null;
        for (const preferredVoice of preferredVoices) {
          // Try to match by name
          selectedVoice = availableVoices.find(v => v.name === preferredVoice);
          if (selectedVoice) break;
          
          // Try to match by language
          selectedVoice = availableVoices.find(v => v.lang === preferredVoice);
          if (selectedVoice) break;
          
          // Try to match by partial name
          selectedVoice = availableVoices.find(v => v.name && v.name.includes(preferredVoice));
          if (selectedVoice) break;
        }
        
        // If no preferred voice found, use the first English voice
        if (!selectedVoice) {
          selectedVoice = availableVoices.find(v => v.lang && v.lang.startsWith('en'));
        }
        
        // If still no voice, use the first available voice
        if (!selectedVoice && availableVoices.length > 0) {
          selectedVoice = availableVoices[0];
        }
        
        if (selectedVoice) {
          console.log('Selected voice:', selectedVoice.name);
          utteranceRef.current.voice = selectedVoice;
        }
        
        // When speech synthesis ends, auto-start listening
        utteranceRef.current.onend = () => {
          setIsSpeaking(false);
          
          // Show "Speak now" notification
          if (!manualInputMode) {
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
              
              // On mobile, we may need to request permission again
              if (isMobileDevice() && !manualInputMode) {
                navigator.mediaDevices.getUserMedia({ audio: true })
                  .then(() => {
                    console.log('Mobile microphone permission confirmed');
                    startSpeaking();
                  })
                  .catch(error => {
                    console.error('Mobile microphone permission error:', error);
                    toast.error('Please allow microphone access to continue or use manual input.');
                    setManualInputMode(true);
                  });
              } else if (!manualInputMode) {
                startSpeaking();
              }
            }, 1000);
          } else {
            toast.info('Question read complete. Please type your answer.', { autoClose: 3000 });
          }
        };
        
        // Handle speech synthesis errors
        utteranceRef.current.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsSpeaking(false);
          toast.error('Failed to speak the question. You can read it on screen.');
        };
        
        // Start speaking
        try {
          window.speechSynthesis.speak(utteranceRef.current);
        } catch (error) {
          console.error('Error starting speech synthesis:', error);
          setIsSpeaking(false);
          toast.error('Failed to read the question. Please continue with the interview.');
        }
      }
    } catch (error) {
      console.error('Error setting up speech synthesis:', error);
      setIsSpeaking(false);
      toast.error('Text-to-speech not available. Please read the questions on screen.');
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
    if (manualInputMode) {
      toast.info('In manual input mode. Please type your answer.');
      return;
    }
    
    // Ensure audio context is resumed (needed for mobile)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
        .then(() => {
          console.log('AudioContext resumed successfully');
        })
        .catch(error => {
          console.error('Failed to resume AudioContext:', error);
        });
    }
    
    try {
      if (!recognitionRef.current) {
        // Try to reinitialize recognition if it's not available
        if (!checkSpeechRecognitionSupport()) {
          toast.warning('Speech recognition not available. Please type your answer.');
          setManualInputMode(true);
          return;
        }
      }
      
      recognitionRef.current.start();
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Failed to start speech recognition. Please try again or type your answer.');
      setIsRecording(false);
      setManualInputMode(true);
    }
  };
  
  // Stop speaking/recording
  const stopSpeaking = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped by user');
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
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
  
  // Toggle manual input mode
  const toggleManualInputMode = () => {
    // Stop recording if active
    if (isRecording) {
      stopSpeaking();
    }
    
    setManualInputMode(!manualInputMode);
    toast.info(manualInputMode ? 
      'Switching to voice input mode if available' : 
      'Switched to manual input mode. You can type your answers.');
  };
  
  // Restart media devices for troubleshooting
  const restartMediaDevices = async () => {
    toast.info('Attempting to restart media devices...');
    
    // Clean up existing resources
    cleanupResources();
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try to reinitialize
    try {
      await initializeMediaDevices();
      toast.success('Media devices restarted successfully');
      
      // If successful, switch back to voice mode
      if (!manualInputMode) {
        setManualInputMode(false);
      }
    } catch (error) {
      console.error('Error restarting media devices:', error);
      toast.error('Failed to restart media devices. Using manual input mode.');
      setManualInputMode(true);
    }
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
    console.log('Cleaning up resources...');
    
    // Stop all tracks from the media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
          console.log(`Stopped ${track.kind} track: ${track.label}`);
        } catch (error) {
          console.error(`Error stopping ${track.kind} track:`, error);
        }
      });
      mediaStreamRef.current = null;
    }
    
    // Stop speech recognition if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        console.log('Aborted speech recognition');
      } catch (error) {
        console.error('Error aborting speech recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    // Stop speech synthesis if active
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        console.log('Cancelled speech synthesis');
      } catch (error) {
        console.error('Error cancelling speech synthesis:', error);
      }
    }
    
    // Close audio context if it exists
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
        console.log('Closed audio context');
      } catch (error) {
        console.error('Error closing audio context:', error);
      }
      audioContextRef.current = null;
    }
    
    // Clear any remaining flags
    recognitionPausedRef.current = false;
    currentTranscriptRef.current = '';
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
  
  // Render troubleshoot button
  const renderTroubleshootButton = () => (
    <div className="fixed bottom-4 right-4 z-10">
      <button
        onClick={restartMediaDevices}
        className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-full shadow-lg flex items-center"
        title="Troubleshoot media devices"
      >
        <i className="fas fa-wrench mr-1"></i>
        <span>{mediaError ? 'Fix Media' : 'Troubleshoot'}</span>
      </button>
    </div>
  );
  
  // Render input mode toggle button
  const renderInputModeToggle = () => (
    <div className="fixed bottom-4 left-4 z-10">
      <button
        onClick={toggleManualInputMode}
        className={`${manualInputMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-2 rounded-full shadow-lg flex items-center`}
        title={manualInputMode ? 'Switch to voice input' : 'Switch to manual input'}
      >
        <i className={`fas ${manualInputMode ? 'fa-microphone' : 'fa-keyboard'} mr-1`}></i>
        <span>{manualInputMode ? 'Voice Input' : 'Manual Input'}</span>
      </button>
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
                  <i className={`fas fa-signal mr-1 ${mediaError ? 'text-red-400' : 'text-green-400'}`}></i>
                  <span>{mediaError ? 'Offline' : 'HD'}</span>
                </div>
                <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <i className={`fas fa-microphone mr-1 ${manualInputMode ? 'text-amber-400' : 'text-green-400'}`}></i>
                  <span>{manualInputMode ? 'Manual' : 'Voice'}</span>
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

              {/* Manual mode indicator */}
              {manualInputMode && (
                <div className="absolute bottom-4 right-4 bg-amber-500 bg-opacity-80 text-white text-xs px-3 py-1 rounded-full flex items-center">
                  <i className="fas fa-keyboard mr-1"></i>
                  <span>Manual Mode</span>
                </div>
              )}

              {/* Camera error message */}
              {mediaError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <div className="text-center text-white px-4">
                    <i className="fas fa-video-slash text-2xl mb-2"></i>
                    <p>Camera unavailable</p>
                    <button 
                      onClick={restartMediaDevices}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Controls section */}
            <div className="flex items-center justify-center space-x-4 mt-6">
              {/* Mic button (shown when not recording and not in manual mode) */}
              {!isRecording && !manualInputMode ? (
                <button
                  onClick={startSpeaking}
                  className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all focus:outline-none"
                  disabled={isRecording || isSpeaking}
                >
                  <i className="fas fa-microphone text-lg"></i>
                </button>
              ) : !manualInputMode ? (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center justify-center w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all focus:outline-none"
                >
                  <i className="fas fa-microphone-slash text-lg"></i>
                </button>
              ) : (
                <button
                  onClick={toggleManualInputMode}
                  className="flex items-center justify-center w-14 h-14 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition-all focus:outline-none"
                  disabled={mediaError || isSpeaking}
                >
                  <i className="fas fa-microphone text-lg"></i>
                </button>
              )}

              {/* Next button (always visible) */}
              <button
                onClick={saveAnswerAndNext}
                className="flex items-center justify-center w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all focus:outline-none"
                disabled={isSpeaking}
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
              
              {manualInputMode && !isSpeaking && (
                <div className="text-sm text-amber-600">
                  <i className="fas fa-keyboard mr-1"></i>
                  <span>Manual Input Mode</span>
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
                placeholder={manualInputMode ? "Type your answer here..." : "Your answer will appear here as you speak..."}
                value={currentAnswer}
                onChange={handleAnswerChange}
                disabled={isRecording && !manualInputMode}
              ></textarea>

              {/* Word/character counter */}
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                <span>{wordCount}</span> words
              </div>

              {showEdit && !isRecording && !manualInputMode && (
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
              
              {!manualInputMode && (
                <div className="absolute top-3 right-3 text-xs">
                  <button
                    onClick={toggleManualInputMode}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <i className="fas fa-keyboard"></i>
                    <span>Type</span>
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
      
      {/* Render troubleshoot button */}
      {renderTroubleshootButton()}
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