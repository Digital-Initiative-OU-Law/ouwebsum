import React, { useState, useEffect } from 'react';
import { Key, ChevronDown } from 'lucide-react';
import { chrome } from '../utils/chrome';

interface ApiKeyInputProps {
  onSave: (apiKey: string) => void;
  onModelChange: (model: string) => void;
}

export function ApiKeyInput({ onSave, onModelChange }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [model, setModel] = useState('gpt-4');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const models = [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ];

  useEffect(() => {
    chrome.storage.sync.get(['openaiApiKey', 'selectedModel']).then((result) => {
      if (result.openaiApiKey) {
        setApiKey(result.openaiApiKey);
        setSaved(true);
        onSave(result.openaiApiKey); // Immediately provide the API key to parent
      }
      
      if (result.selectedModel) {
        setModel(result.selectedModel);
        onModelChange(result.selectedModel);
      } else {
        onModelChange(model);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    await chrome.storage.sync.set({ 
      openaiApiKey: apiKey,
      selectedModel: model
    });
    setSaved(true);
    onSave(apiKey);
  };

  const handleModelSelect = (modelId: string) => {
    setModel(modelId);
    setShowModelDropdown(false);
    chrome.storage.sync.set({ selectedModel: modelId });
    onModelChange(modelId);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-2 mb-2">
        <Key className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold">OpenAI API Key</h2>
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setSaved(false);
          }}
          placeholder="Enter your OpenAI API key"
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-ou-crimson"
        />
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="px-4 py-2 text-white bg-ou-crimson rounded hover:bg-ou-crimson-dark focus:outline-none focus:ring-2 focus:ring-ou-crimson disabled:opacity-50"
        >
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model
        </label>
        <div className="relative">
          <button
            type="button"
            className="w-full flex justify-between items-center px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-ou-crimson"
            onClick={() => setShowModelDropdown(!showModelDropdown)}
          >
            <span>{models.find(m => m.id === model)?.name || model}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {showModelDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {models.map((m) => (
                <button
                  key={m.id}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                  onClick={() => handleModelSelect(m.id)}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}