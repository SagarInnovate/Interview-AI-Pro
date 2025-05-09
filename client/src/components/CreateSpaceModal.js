import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';

const CreateSpaceModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    jobPosition: '',
    jobDescription: '',
    interviewRounds: [],
    resume: null
  });

  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Available round options
  const roundOptions = [
    { id: 'hr', name: 'HR' },
    { id: 'technical', name: 'Technical' },
    { id: 'system-design', name: 'System Design' },
    { id: 'behavioral', name: 'Behavioral' },
    { id: 'culture-fit', name: 'Culture Fit' },
    { id: 'case-study', name: 'Case Study' },
    { id: 'final', name: 'Final' }
  ];

  // Handler for basic field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handler for checkbox changes (interview rounds)
  const handleRoundChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        interviewRounds: [...formData.interviewRounds, value]
      });
    } else {
      setFormData({
        ...formData,
        interviewRounds: formData.interviewRounds.filter(round => round !== value)
      });
    }
  };

  // Handler for file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData({
        ...formData,
        resume: file
      });
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      resetForm();
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form on close
  const resetForm = () => {
    setFormData({
      companyName: '',
      jobPosition: '',
      jobDescription: '',
      interviewRounds: [],
      resume: null
    });
    setFileName('');
    setActiveStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Next step handler
  const handleNextStep = () => {
    setActiveStep(activeStep + 1);
  };

  // Previous step handler
  const handlePrevStep = () => {
    setActiveStep(activeStep - 1);
  };

  // Validate current step
  const validateStep = () => {
    switch (activeStep) {
      case 1:
        return formData.companyName.trim() !== '' && formData.jobPosition.trim() !== '';
      case 2:
        return formData.interviewRounds.length > 0;
      case 3:
        return formData.resume !== null;
      default:
        return false;
    }
  };

  // Get step title
  const getStepTitle = () => {
    switch (activeStep) {
      case 1:
        return 'Company & Position Details';
      case 2:
        return 'Interview Rounds';
      case 3:
        return 'Upload Resume';
      default:
        return '';
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="fixed inset-0 z-50 overflow-y-auto" 
        onClose={handleClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title 
                as="h3" 
                className="text-lg font-bold text-gray-900 mb-2 flex items-center justify-between"
              >
                <span>{getStepTitle()}</span>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Dialog.Title>

              {/* Step indicators */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="w-full flex items-center">
                    {[1, 2, 3].map((step) => (
                      <React.Fragment key={step}>
                        <div className="relative flex flex-col items-center">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                              step === activeStep 
                                ? 'bg-indigo-600 text-white'
                                : step < activeStep 
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {step < activeStep ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              step
                            )}
                          </div>
                          <span className="absolute -bottom-6 text-xs font-medium text-gray-600 w-20 text-center">
                            {step === 1 ? 'Company' : step === 2 ? 'Rounds' : 'Resume'}
                          </span>
                        </div>
                        {step < 3 && (
                          <div className={`flex-1 h-0.5 ${step < activeStep ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8">
                {/* Step 1: Company & Position */}
                {activeStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Google, Amazon, Microsoft"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="jobPosition" className="block text-sm font-medium text-gray-700 mb-1">
                          Job Position *
                        </label>
                        <input
                          type="text"
                          id="jobPosition"
                          name="jobPosition"
                          value={formData.jobPosition}
                          onChange={handleChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Frontend Developer, Data Scientist"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                          Job Description
                        </label>
                        <textarea
                          id="jobDescription"
                          name="jobDescription"
                          value={formData.jobDescription}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Paste the job description here..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Adding a job description helps our AI generate more relevant interview questions.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Interview Rounds */}
                {activeStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        Select the interview rounds you need to prepare for. Our AI will generate tailored questions for each round.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {roundOptions.map((round) => (
                          <div key={round.id} className="flex items-start">
                            <input
                              id={round.id}
                              name="interviewRounds"
                              value={round.name}
                              type="checkbox"
                              checked={formData.interviewRounds.includes(round.name)}
                              onChange={handleRoundChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                            />
                            <label htmlFor={round.id} className="ml-2 block text-sm text-gray-700">
                              {round.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      {formData.interviewRounds.length === 0 && (
                        <p className="text-xs text-red-500 mt-2">
                          Please select at least one interview round.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Resume Upload */}
                {activeStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload your resume. Our AI will analyze it to generate personalized interview questions.
                      </p>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="resume"
                          name="resume"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        {!fileName ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">
                              Drag and drop your resume here, or{' '}
                              <label htmlFor="resume" className="text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">
                                browse files
                              </label>
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Supported formats: PDF, DOC, DOCX (Max 10MB)
                            </p>
                          </>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900">{fileName}</p>
                              <p className="text-xs text-gray-500">
                                <label htmlFor="resume" className="text-indigo-600 hover:text-indigo-700 cursor-pointer">
                                  Change file
                                </label>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {activeStep === 3 && !formData.resume && (
                        <p className="text-xs text-red-500 mt-2">
                          Please upload your resume to continue.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Navigation buttons */}
                <div className="mt-8 flex justify-between">
                  {activeStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  
                  {activeStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!validateStep()}
                      className={`px-4 py-2 rounded-lg ${
                        validateStep()
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-indigo-300 text-white cursor-not-allowed'
                      } transition-colors`}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !validateStep()}
                      className={`px-4 py-2 rounded-lg flex items-center ${
                        validateStep() && !loading
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-indigo-300 text-white cursor-not-allowed'
                      } transition-colors`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        'Create Space'
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateSpaceModal;