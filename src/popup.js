// Add debug flag
const DEBUG = true; // Temporarily enable debug for testing custom instructions

document.addEventListener('DOMContentLoaded', function() {
  // Only log if in debug mode
  if (DEBUG) console.log('DOM loaded - initializing extension');
  
  const apiKeyInput = document.getElementById('apiKey');
  const saveApiKeyBtn = document.getElementById('saveApiKey');
  const modelSelect = document.getElementById('model');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const errorDiv = document.getElementById('error');
  const errorText = document.getElementById('errorText');
  const loadingDiv = document.getElementById('loading');
  const summarySection = document.getElementById('summarySection');
  const bulletPointsList = document.getElementById('bulletPoints');
  const paragraphDiv = document.getElementById('paragraph');
  
  // Settings modal elements
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const instructionsList = document.getElementById('instructionsList');
  const instructionForm = document.getElementById('instructionForm');
  const profileNameInput = document.getElementById('profileName');
  const instructionsInput = document.getElementById('instructions');
  const saveInstructionBtn = document.getElementById('saveInstructionBtn');
  const instructionProfileSelect = document.getElementById('instructionProfile');
  
  // Debug check if all elements were found
  if (DEBUG) {
    console.log('Element check:');
    console.log('- apiKeyInput:', !!apiKeyInput);
    console.log('- saveApiKeyBtn:', !!saveApiKeyBtn);
    console.log('- summarizeBtn:', !!summarizeBtn);
    console.log('- settingsBtn:', !!settingsBtn);
    console.log('- settingsModal:', !!settingsModal);
  }
  
  // State variables
  let customInstructions = [];
  let editingIndex = -1;
  
  // Load saved API key and model
  if (DEBUG) console.log('Attempting to load data from chrome.storage.sync...');
  
  try {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
      console.error('Chrome storage API not available!');
      showError('Chrome storage API not available. Extension may not work properly.');
      return;
    }
    
    chrome.storage.sync.get(['openaiApiKey', 'selectedModel', 'customInstructions', 'selectedInstructionProfile'], function(result) {
      if (chrome.runtime.lastError) {
        console.error('Error loading from storage:', chrome.runtime.lastError);
        return;
      }
      
      if (DEBUG) console.log('Loaded storage data:', result);
      if (result.openaiApiKey) {
        if (DEBUG) console.log('API key found, enabling button');
        apiKeyInput.value = result.openaiApiKey;
        summarizeBtn.disabled = false;
      } else {
        if (DEBUG) console.log('No API key found, button remains disabled');
      }
      
      if (result.selectedModel) {
        if (DEBUG) console.log('Setting model to:', result.selectedModel);
        modelSelect.value = result.selectedModel;
      }
      
      if (result.customInstructions && Array.isArray(result.customInstructions)) {
        if (DEBUG) console.log('Custom instructions found:', result.customInstructions.length);
        customInstructions = result.customInstructions;
        updateInstructionsList();
        populateInstructionProfileSelect();
        
        if (result.selectedInstructionProfile !== undefined) {
          if (DEBUG) console.log('Setting selected profile to:', result.selectedInstructionProfile);
          instructionProfileSelect.value = result.selectedInstructionProfile;
        }
      }
    });
  } catch (err) {
    console.error('Exception during storage initialization:', err);
  }
  
  // Save API key
  saveApiKeyBtn.addEventListener('click', function() {
    if (DEBUG) console.log('Save API key button clicked');
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      if (DEBUG) console.log('Saving API key');
      try {
        chrome.storage.sync.set({ openaiApiKey: apiKey }, function() {
          if (chrome.runtime.lastError) {
            console.error('Error saving API key:', chrome.runtime.lastError);
            showError('Failed to save API key: ' + chrome.runtime.lastError.message);
            return;
          }
          
          if (DEBUG) console.log('API key saved successfully');
          saveApiKeyBtn.textContent = 'Saved';
          summarizeBtn.disabled = false;
          setTimeout(() => {
            saveApiKeyBtn.textContent = 'Save';
          }, 2000);
        });
      } catch (err) {
        console.error('Exception during API key save:', err);
        showError('Error saving API key: ' + err.message);
      }
    } else {
      if (DEBUG) console.log('No API key to save');
    }
  });
  
  // Save selected model
  modelSelect.addEventListener('change', function() {
    if (DEBUG) console.log('Model changed to:', modelSelect.value);
    try {
      chrome.storage.sync.set({ selectedModel: modelSelect.value }, function() {
        if (chrome.runtime.lastError) {
          console.error('Error saving model:', chrome.runtime.lastError);
        } else {
          if (DEBUG) console.log('Model saved successfully');
        }
      });
    } catch (err) {
      console.error('Exception during model save:', err);
    }
  });
  
  // Open settings modal
  settingsBtn.addEventListener('click', function() {
    if (DEBUG) console.log('Settings button clicked');
    try {
      settingsModal.style.display = 'flex';
      if (DEBUG) console.log('Settings modal display set to:', settingsModal.style.display);
      resetInstructionForm();
    } catch (err) {
      console.error('Error opening settings modal:', err);
    }
  });
  
  // Close settings modal
  closeModalBtn.addEventListener('click', function() {
    settingsModal.style.display = 'none';
  });
  
  cancelBtn.addEventListener('click', function() {
    if (editingIndex >= 0) {
      resetInstructionForm();
    } else {
      settingsModal.style.display = 'none';
    }
  });
  
  // Close modal when clicking outside
  settingsModal.addEventListener('click', function(e) {
    if (e.target === settingsModal) {
      settingsModal.style.display = 'none';
    }
  });
  
  // Save instruction profile
  saveInstructionBtn.addEventListener('click', function() {
    const profileName = profileNameInput.value.trim();
    const instructions = instructionsInput.value.trim();
    
    if (!profileName || !instructions) {
      alert('Please enter both a profile name and instructions.');
      return;
    }
    
    if (editingIndex >= 0) {
      // Update existing profile
      customInstructions[editingIndex] = { name: profileName, instructions };
    } else {
      // Add new profile
      customInstructions.push({ name: profileName, instructions });
    }
    
    // Save to storage
    chrome.storage.sync.set({ customInstructions }, function() {
      updateInstructionsList();
      populateInstructionProfileSelect();
      resetInstructionForm();
    });
  });
  
  // Handle instruction profile selection
  instructionProfileSelect.addEventListener('change', function() {
    const selectedValue = instructionProfileSelect.value;
    console.log('Instruction profile changed to:', selectedValue);
    
    chrome.storage.sync.set({ selectedInstructionProfile: selectedValue }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving selected profile:', chrome.runtime.lastError);
      } else {
        console.log('Selected profile saved successfully');
      }
    });
  });
  
  // Update instructions list in the modal
  function updateInstructionsList() {
    instructionsList.innerHTML = '';
    
    if (customInstructions.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.textContent = 'No custom instruction profiles yet. Create one below.';
      instructionsList.appendChild(emptyMessage);
      return;
    }
    
    customInstructions.forEach((profile, index) => {
      const item = document.createElement('div');
      item.className = 'instruction-item';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'instruction-name';
      nameSpan.textContent = profile.name;
      
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'instruction-actions';
      
      const editBtn = document.createElement('button');
      editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
      editBtn.title = 'Edit';
      editBtn.addEventListener('click', () => editInstructionProfile(index));
      
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
      deleteBtn.title = 'Delete';
      deleteBtn.addEventListener('click', () => deleteInstructionProfile(index));
      
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);
      
      item.appendChild(nameSpan);
      item.appendChild(actionsDiv);
      
      instructionsList.appendChild(item);
    });
  }
  
  // Populate the instruction profile dropdown
  function populateInstructionProfileSelect() {
    // Save the current selection
    const currentSelection = instructionProfileSelect.value;
    
    // Clear existing options except the default
    while (instructionProfileSelect.options.length > 1) {
      instructionProfileSelect.remove(1);
    }
    
    // Add custom instruction profiles
    customInstructions.forEach((profile, index) => {
      const option = document.createElement('option');
      option.value = index.toString();
      option.textContent = profile.name;
      instructionProfileSelect.appendChild(option);
    });
    
    // Restore selection if possible
    if (currentSelection && instructionProfileSelect.querySelector(`option[value="${currentSelection}"]`)) {
      instructionProfileSelect.value = currentSelection;
    }
  }
  
  // Edit instruction profile
  function editInstructionProfile(index) {
    const profile = customInstructions[index];
    profileNameInput.value = profile.name;
    instructionsInput.value = profile.instructions;
    editingIndex = index;
    saveInstructionBtn.textContent = 'Update Profile';
    cancelBtn.textContent = 'Cancel Edit';
  }
  
  // Delete instruction profile
  function deleteInstructionProfile(index) {
    if (confirm(`Are you sure you want to delete the profile "${customInstructions[index].name}"?`)) {
      customInstructions.splice(index, 1);
      
      // Update storage
      chrome.storage.sync.set({ customInstructions }, function() {
        // If the deleted profile was selected, reset to default
        chrome.storage.sync.get(['selectedInstructionProfile'], function(result) {
          if (result.selectedInstructionProfile == index) {
            chrome.storage.sync.set({ selectedInstructionProfile: '' });
            instructionProfileSelect.value = '';
          }
          
          updateInstructionsList();
          populateInstructionProfileSelect();
        });
      });
    }
  }
  
  // Reset instruction form
  function resetInstructionForm() {
    profileNameInput.value = '';
    instructionsInput.value = '';
    editingIndex = -1;
    saveInstructionBtn.textContent = 'Save Profile';
    cancelBtn.textContent = 'Cancel';
  }
  
  // Summarize page
  summarizeBtn.addEventListener('click', function() {
    if (DEBUG) console.log('Summarize button clicked');
    // Reset UI
    errorDiv.style.display = 'none';
    summarySection.style.display = 'none';
    loadingDiv.style.display = 'flex';
    
    // First check if we can communicate with the content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || !tabs[0] || !tabs[0].id) {
        showError('Could not access the current tab');
        return;
      }
      
      if (DEBUG) console.log('Checking content script on tab:', tabs[0].id);
      
      // Try to send a test message to verify content script is loaded
      chrome.tabs.sendMessage(tabs[0].id, { action: 'ping' }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Content script error:', chrome.runtime.lastError);
          showError('Content script not loaded. Please refresh the page and try again.');
          return;
        }
        
        if (DEBUG) console.log('Content script responded:', response);
        proceedWithSummarization(tabs[0].id);
      });
    });
  });
  
  function proceedWithSummarization(tabId) {
    chrome.storage.sync.get(['openaiApiKey', 'customInstructions', 'selectedInstructionProfile'], function(result) {
      if (!result.openaiApiKey) {
        showError('Please enter your OpenAI API key');
        return;
      }
      
      // Get selected custom instructions if any
      let customInstruction = '';
      if (result.selectedInstructionProfile !== '' && result.selectedInstructionProfile !== undefined) {
        const profileIndex = parseInt(result.selectedInstructionProfile);
        console.log('Selected profile index:', profileIndex);
        console.log('Available custom instructions:', result.customInstructions);
        
        if (!isNaN(profileIndex) && result.customInstructions && result.customInstructions[profileIndex]) {
          customInstruction = result.customInstructions[profileIndex].instructions;
          console.log('Using custom instruction:', customInstruction);
        } else {
          console.log('Custom instruction profile not found or invalid');
        }
      } else {
        console.log('No custom instruction profile selected');
      }
      
      // Get page content
      chrome.tabs.sendMessage(tabId, { action: 'getContent' }, function(response) {
        if (!response || !response.content) {
          showError('Could not extract content from the page');
          return;
        }
        
        // Send to background script for summarization
        console.log('Sending summarize request with custom instruction:', customInstruction ? 'Yes' : 'No');
        chrome.runtime.sendMessage({
          action: 'summarize',
          content: response.content,
          apiKey: result.openaiApiKey,
          model: modelSelect.value,
          customInstruction: customInstruction
        }, function(result) {
          loadingDiv.style.display = 'none';
          
          if (result.error) {
            showError(result.error);
            return;
          }
          
          if (!result.success || !result.summary) {
            showError('Failed to generate summary');
            return;
          }
          
          // Parse and display summary
          displaySummary(result.summary);
        });
      });
    });
  }
  
  function showError(message) {
    loadingDiv.style.display = 'none';
    errorText.textContent = message;
    errorDiv.style.display = 'flex';
  }
  
  function displaySummary(summary) {
    try {
      // Clear previous content
      bulletPointsList.innerHTML = '';
      paragraphDiv.textContent = '';
      
      // Parse the summary
      const sections = summary.split(/\n{2,}/);
      
      // Find the bullet points section
      const bulletSection = sections.find(section => 
        section.includes('\n') && /^[\d\-\*•]/.test(section.trim())
      ) || sections[0];
      
      // The paragraph is likely the longest section without bullet points
      const paragraphSection = sections
        .filter(section => section !== bulletSection)
        .sort((a, b) => b.length - a.length)[0] || '';
      
      // Display bullet points
      const bulletItems = bulletSection
        .split('\n')
        .map(line => line.replace(/^[\d\-\*•]+\.?\s*/, '').trim())
        .filter(line => line.length > 0);
      
      bulletItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        bulletPointsList.appendChild(li);
      });
      
      // Display paragraph
      paragraphDiv.textContent = paragraphSection.trim();
      
      // Show summary section
      summarySection.style.display = 'block';
    } catch (err) {
      // If parsing fails, just display the raw summary
      bulletPointsList.innerHTML = '';
      const li = document.createElement('li');
      li.textContent = summary;
      bulletPointsList.appendChild(li);
      paragraphDiv.textContent = '';
      summarySection.style.display = 'block';
    }
  }
}); 