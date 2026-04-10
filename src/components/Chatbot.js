import React, { useState, useEffect, useRef } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your grievance assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // FAQ responses
    if (lowerMessage.includes('submit') || lowerMessage.includes('file') || lowerMessage.includes('complaint')) {
      return "To submit a complaint, click on 'Submit Complaint' in the sidebar. Fill in all required fields including title, description, category, and priority. You can also attach supporting documents up to 10MB each.";
    }
    
    if (lowerMessage.includes('track') || lowerMessage.includes('status') || lowerMessage.includes('progress')) {
      return "You can track your complaint status by visiting 'My Complaints' section. Each complaint shows its current status (Pending, In Progress, or Resolved) and progress percentage for ongoing issues.";
    }
    
    if (lowerMessage.includes('anonymous') || lowerMessage.includes('identity')) {
      return "Yes, you can submit complaints anonymously! Check the 'Submit anonymously' box when filing a complaint. Your identity will be hidden from authorities but securely stored in the system.";
    }
    
    if (lowerMessage.includes('priority') || lowerMessage.includes('urgent') || lowerMessage.includes('high')) {
      return "Complaints are categorized into three priority levels: High (urgent issues requiring immediate attention), Medium (important but not critical), and Low (minor issues). High priority complaints are addressed first.";
    }
    
    if (lowerMessage.includes('department') || lowerMessage.includes('assigned')) {
      return "Complaints are automatically routed to the appropriate department based on the category you select. For example, IT-related issues go to the IT Department, while hostel issues go to Hostel Management.";
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('resolve') || lowerMessage.includes('how long')) {
      return "Resolution time varies by priority and complexity. High priority issues are typically resolved within 24-48 hours, medium priority within 3-5 days, and low priority within 7-10 days.";
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "For additional support, you can: 1) Email us at support@university.edu, 2) Call the helpline at 1800-123-4567, 3) Visit the student support center in the main building, or 4) Use the 'Help' section in the sidebar.";
    }
    
    if (lowerMessage.includes('escalate') || lowerMessage.includes('unsatisfied') || lowerMessage.includes('higher')) {
      return "If you're not satisfied with the resolution, you can: 1) Reply to your complaint with additional details, 2) Request escalation to a higher authority, or 3) Submit a new complaint referencing the original issue.";
    }
    
    // Default response
    return "I can help you with information about submitting complaints, tracking status, anonymous submissions, priority levels, department assignments, resolution times, and escalation procedures. What specific information do you need?";
  };

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: generateBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    "How to submit a complaint?",
    "Track my complaint status",
    "Anonymous submission",
    "Resolution time",
    "Contact support"
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors duration-200 group"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
          <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Need help? Chat with assistant
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
          <div>
            <h3 className="font-medium">Grievance Assistant</h3>
            <p className="text-xs text-blue-100">Always here to help</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-blue-700 rounded p-1"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(action)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={inputMessage.trim() === '' || isTyping}
            className="bg-blue-600 text-white rounded-md px-3 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
