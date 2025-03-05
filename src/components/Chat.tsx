import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatProps {
  onSendMessage: (message: string) => Promise<string>;
}

export function Chat({ onSendMessage }: ChatProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = message;
    setMessage('');
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Get response from API
      const response = await onSendMessage(userMessage);
      
      // Add assistant response to chat
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Chat with the Page</h3>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="h-60 overflow-y-auto p-3 bg-gray-50">
          {chatHistory.length === 0 ? (
            <div className="text-gray-500 text-center mt-20">
              Ask a question about this page
            </div>
          ) : (
            <div className="space-y-3">
              {chatHistory.map((chat, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-lg ${
                    chat.role === 'user' 
                      ? 'bg-ou-crimson text-white ml-6' 
                      : 'bg-gray-200 text-gray-800 mr-6'
                  }`}
                >
                  {chat.content}
                </div>
              ))}
              
              {isLoading && (
                <div className="bg-gray-200 text-gray-800 p-2 rounded-lg mr-6 animate-pulse">
                  Thinking...
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center p-2 border-t">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this page..."
            className="flex-1 p-2 focus:outline-none resize-none"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="p-2 rounded-full bg-ou-crimson text-white disabled:opacity-50 ml-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}