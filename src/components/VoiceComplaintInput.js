import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, StopIcon, XMarkIcon } from '@heroicons/react/24/outline';

const VoiceComplaintInput = ({ onTranscriptComplete, placeholder = "Start speaking..." }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        if (transcript.trim()) {
          handleTranscriptComplete();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      setTranscript('');
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      }

      // Also record audio for potential playback
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Store audio blob if needed for future use
      };

      mediaRecorderRef.current.start();

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
  };

  const handleTranscriptComplete = () => {
    if (transcript.trim()) {
      setIsProcessing(true);
      
      // Simulate processing delay
      setTimeout(() => {
        const audioBlob = audioChunksRef.current.length > 0 
          ? new Blob(audioChunksRef.current, { type: 'audio/wav' })
          : null;
        
        onTranscriptComplete(transcript.trim(), audioBlob);
        setIsProcessing(false);
        setTranscript('');
      }, 500);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setError('');
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      handleTranscriptComplete();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="space-y-4">
        {/* Recording Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isRecording && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600 font-medium">Recording...</span>
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-spin"></div>
                <span className="text-sm text-blue-600 font-medium">Processing...</span>
              </div>
            )}
            {!isRecording && !isProcessing && transcript && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Ready to submit</span>
              </div>
            )}
          </div>
          
          {transcript && !isRecording && !isProcessing && (
            <button
              onClick={clearTranscript}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Transcript Display */}
        <div className="min-h-[100px] p-3 bg-gray-50 border border-gray-200 rounded-md">
          {transcript ? (
            <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
          ) : (
            <p className="text-gray-400 italic">{placeholder}</p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording && !isProcessing && (
            <button
              onClick={startRecording}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <MicrophoneIcon className="h-5 w-5 mr-2" />
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <StopIcon className="h-5 w-5 mr-2" />
              Stop Recording
            </button>
          )}

          {transcript && !isRecording && !isProcessing && (
            <button
              onClick={handleSubmit}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Submit Transcript
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Click "Start Recording" to begin voice input</p>
          <p>• Speak clearly and naturally</p>
          <p>• Click "Stop Recording" when finished</p>
          <p>• Review and submit your transcript</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceComplaintInput;
