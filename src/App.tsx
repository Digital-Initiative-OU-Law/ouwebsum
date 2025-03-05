import React, { useState } from 'react';
import { ApiKeyInput } from './components/ApiKeyInput';
import { Summary } from './components/Summary';
import { Chat } from './components/Chat';
import { Brain, AlertCircle, Settings } from 'lucide-react';
import { chrome } from './utils/chrome';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [bulletPoints, setBulletPoints] = useState<string[]>([]);
  const [paragraph, setParagraph] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [customInstruction, setCustomInstruction] = useState('');
  const [customInstructions, setCustomInstructions] = useState<{id: string, name: string, instruction: string}[]>([
    { id: 'default', name: 'None (Default Summarization)', instruction: '' },
    { id: 'academic', name: 'Academic Focus', instruction: 'Focus on academic concepts and research findings.' },
    { id: 'technical', name: 'Technical Details', instruction: 'Emphasize technical details and implementation specifics.' }
  ]);

  // Load saved API key and settings on component mount
  React.useEffect(() => {
    chrome.storage.sync.get(['openaiApiKey', 'selectedModel', 'customInstructions', 'selectedInstruction']).then((result) => {
      if (result.openaiApiKey) {
        setApiKey(result.openaiApiKey);
      }
      
      if (result.selectedModel) {
        setModel(result.selectedModel);
      }
      
      if (result.customInstructions) {
        setCustomInstructions(result.customInstructions);
      }
      
      if (result.selectedInstruction) {
        setCustomInstruction(result.selectedInstruction);
      }
    });
  }, []);

  const summarizeContent = async () => {
    if (!apiKey) return;

    setLoading(true);
    setError(null);
    setBulletPoints([]);
    setParagraph('');
    
    try {
      // Get the current tab's content
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.id) {
        throw new Error('Could not access the current tab. Please refresh and try again.');
      }
      
      let pageContent;
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getContent' });
        
        if (!response || !response.content || response.content.trim().length < 50) {
          throw new Error('Could not extract meaningful content from this page.');
        }
        
        pageContent = response.content.slice(0, 15000); // Truncate to avoid token limits
      } catch (err) {
        throw new Error('Failed to extract content from the page. The extension may not have permission to access this page.');
      }

      // Use background script to handle API call
      const result = await chrome.runtime.sendMessage({
        action: 'summarize',
        content: pageContent,
        apiKey,
        model,
        customInstruction
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.success || !result.summary) {
        throw new Error('Failed to generate summary');
      }

      const summary = result.summary;

      // Parse the response into bullet points and paragraph
      try {
        const sections = summary.split(/\n{2,}/);
        
        // Find the bullet points section (contains line breaks and starts with numbers or bullet markers)
        const bulletSection = sections.find(section => 
          section.includes('\n') && /^[\d\-\*•]/.test(section.trim())
        ) || sections[0];
        
        // The paragraph is likely the longest section without bullet points
        const paragraphSection = sections
          .filter(section => section !== bulletSection)
          .sort((a, b) => b.length - a.length)[0] || '';
        
        const bulletItems = bulletSection
          .split('\n')
          .map(line => line.replace(/^[\d\-\*•]+\.?\s*/, '').trim())
          .filter(line => line.length > 0);
        
        setBulletPoints(bulletItems);
        setParagraph(paragraphSection.trim());
      } catch (err) {
        // If parsing fails, just display the raw summary
        setBulletPoints([summary]);
        setParagraph('');
      }
    } catch (error) {
      console.error('Failed to summarize:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (message: string) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.id) {
        throw new Error('Could not access the current tab');
      }
      
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getContent' });
      
      if (!response || !response.content) {
        throw new Error('Could not extract content from the page');
      }

      // Truncate content if it's too long
      const pageContent = response.content.slice(0, 15000);

      // Use background script to handle API call
      const result = await chrome.runtime.sendMessage({
        action: 'chat',
        content: pageContent,
        message,
        apiKey,
        model,
        customInstruction
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.success) {
        throw new Error('Failed to generate response');
      }
      
      return result.response;
    } catch (error) {
      console.error('Chat error:', error);
      return `Error: ${error instanceof Error ? error.message : 'Failed to get a response'}`;
    }
  };

  const handleAddCustomInstruction = () => {
    const newInstruction = {
      id: `custom-${Date.now()}`,
      name: 'New Custom Instruction',
      instruction: ''
    };
    
    const updatedInstructions = [...customInstructions, newInstruction];
    setCustomInstructions(updatedInstructions);
    
    // Save to storage
    chrome.storage.sync.set({ customInstructions: updatedInstructions });
  };

  const handleUpdateCustomInstruction = (id: string, name: string, instruction: string) => {
    const updatedInstructions = customInstructions.map(item => 
      item.id === id ? { ...item, name, instruction } : item
    );
    
    setCustomInstructions(updatedInstructions);
    
    // Save to storage
    chrome.storage.sync.set({ customInstructions: updatedInstructions });
  };

  const handleSelectCustomInstruction = (instruction: string) => {
    setCustomInstruction(instruction);
    
    // Save to storage
    chrome.storage.sync.set({ selectedInstruction: instruction });
  };

  return (
    <div className="w-96 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-ou-crimson text-white">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          <h1 className="text-xl font-bold">OU Websum</h1>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 rounded-full hover:bg-ou-crimson-dark focus:outline-none focus:ring-2 focus:ring-white"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <ApiKeyInput 
          onSave={setApiKey} 
          onModelChange={setModel}
        />
        
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-medium mb-2">Custom Instructions</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Instruction
              </label>
              <select 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-ou-crimson"
                value={customInstruction}
                onChange={(e) => handleSelectCustomInstruction(e.target.value)}
              >
                {customInstructions.map(item => (
                  <option key={item.id} value={item.instruction}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleAddCustomInstruction}
              className="w-full px-4 py-2 text-white bg-ou-crimson rounded hover:bg-ou-crimson-dark focus:outline-none focus:ring-2 focus:ring-ou-crimson"
            >
              Add Custom Instruction
            </button>
            
            {customInstructions.filter(item => item.id !== 'default').map(item => (
              <div key={item.id} className="mt-3 p-3 bg-white rounded border">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateCustomInstruction(item.id, e.target.value, item.instruction)}
                  className="w-full px-3 py-1 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-ou-crimson"
                  placeholder="Instruction Name"
                />
                <textarea
                  value={item.instruction}
                  onChange={(e) => handleUpdateCustomInstruction(item.id, item.name, e.target.value)}
                  className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-ou-crimson"
                  placeholder="Custom instruction for the AI"
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}
        
        {apiKey && (
          <button
            onClick={summarizeContent}
            disabled={loading}
            className="w-full mt-4 px-4 py-2 bg-ou-crimson text-white rounded hover:bg-ou-crimson-dark focus:outline-none focus:ring-2 focus:ring-ou-crimson-light disabled:opacity-50"
          >
            {loading ? 'Summarizing...' : 'Summarize Page'}
          </button>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {(bulletPoints.length > 0 || loading) && (
          <Summary
            bulletPoints={bulletPoints}
            paragraph={paragraph}
            loading={loading}
          />
        )}

        {apiKey && <Chat onSendMessage={handleChat} />}
      </div>
    </div>
  );
}

export default App;
