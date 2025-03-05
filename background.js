// Background script for OU Websum extension

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('OU Websum extension installed');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);
  
  if (request.action === 'summarize') {
    console.log('Processing summarize request...');
    handleSummarize(request.content, request.apiKey, request.model, request.customInstruction)
      .then(result => {
        console.log('Summarize completed successfully');
        sendResponse(result);
      })
      .catch(error => {
        console.error('Error in summarize:', error);
        sendResponse({ error: error.message });
      });
    return true; // Indicates async response
  }
  
  if (request.action === 'chat') {
    console.log('Processing chat request...');
    handleChat(request.content, request.message, request.apiKey, request.model, request.customInstruction)
      .then(result => {
        console.log('Chat completed successfully');
        sendResponse(result);
      })
      .catch(error => {
        console.error('Error in chat:', error);
        sendResponse({ error: error.message });
      });
    return true; // Indicates async response
  }
  
  // Default response for unhandled messages
  console.log('Unhandled message type:', request.action);
  sendResponse({ error: 'Unhandled message type' });
  return true;
});

/**
 * Handles summarization requests by calling the OpenAI API
 */
async function handleSummarize(content, apiKey, model, customInstruction) {
  try {
    // Check if content is too short or empty
    if (!content || content.trim().length < 100) {
      throw new Error('Not enough content was extracted from the page. The page might be protected or have limited accessible text.');
    }
    
    // Check if API key is provided
    if (!apiKey) {
      throw new Error('API key is required. Please enter your OpenAI API key in the settings.');
    }
    
    // Prepare the system message
    let systemMessage;
    
    // Use custom instructions if provided, otherwise use default
    if (customInstruction && customInstruction.trim().length > 0) {
      console.log('Using custom instruction:', customInstruction);
      systemMessage = customInstruction;
    } else {
      systemMessage = "You are a helpful assistant that summarizes web page content. Provide a concise summary in two parts: 1) A list of 5-7 key bullet points, and 2) A paragraph summary of about 3-4 sentences.";
    }
    
    // Prepare the API request
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: `Please summarize the following web page content:\n\n${content}`
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      })
    });
    
    // Check for HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key and try again.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later or check your OpenAI account limits.');
      } else {
        throw new Error(`OpenAI API error: ${errorMessage}`);
      }
    }
    
    // Parse the response
    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      throw new Error(data.error.message || 'OpenAI API error');
    }
    
    // Extract the summary from the response
    const summary = data.choices && data.choices[0] && data.choices[0].message ? 
      data.choices[0].message.content : 
      'Failed to generate summary';
    
    return { success: true, summary };
  } catch (error) {
    console.error('Error in handleSummarize:', error);
    return { error: error.message || 'Unknown error occurred' };
  }
}

/**
 * Handles chat requests by calling the OpenAI API
 */
async function handleChat(content, message, apiKey, model, customInstruction) {
  try {
    // Check if API key is provided
    if (!apiKey) {
      throw new Error('API key is required. Please enter your OpenAI API key in the settings.');
    }
    
    // Prepare the system message
    let systemMessage;
    
    // Use custom instructions if provided, otherwise use default
    if (customInstruction && customInstruction.trim().length > 0) {
      console.log('Using custom instruction for chat:', customInstruction);
      systemMessage = customInstruction;
    } else {
      systemMessage = "You are a helpful assistant that can answer questions about web page content.";
    }
    
    // Prepare the API request
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: `Here is the content of a web page:\n\n${content}\n\nBased on this content, please answer the following question or respond to this request: ${message}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    // Check for HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key and try again.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later or check your OpenAI account limits.');
      } else {
        throw new Error(`OpenAI API error: ${errorMessage}`);
      }
    }
    
    // Parse the response
    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      throw new Error(data.error.message || 'OpenAI API error');
    }
    
    // Extract the response from the API
    const chatResponse = data.choices && data.choices[0] && data.choices[0].message ? 
      data.choices[0].message.content : 
      'Failed to generate response';
    
    return { success: true, response: chatResponse };
  } catch (error) {
    console.error('Error in handleChat:', error);
    return { error: error.message || 'Unknown error occurred' };
  }
} 