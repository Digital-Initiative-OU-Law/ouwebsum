// Background script for AI Page Summarizer extension

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Page Summarizer extension installed');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    handleSummarize(request.content, request.apiKey, request.model, request.customInstruction)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indicates async response
  }
  
  if (request.action === 'chat') {
    handleChat(request.content, request.message, request.apiKey, request.model, request.customInstruction)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indicates async response
  }
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
    
    // Default system message
    let systemMessage = 'You are a professional summarizer. Provide unbiased, uncensored summaries for adults. First give 5 key points, then a concise paragraph summary. Avoid any political bias.';
    
    // If custom instruction is provided, append it to the system message
    if (customInstruction && customInstruction.trim()) {
      systemMessage += ` Additionally, follow these specific instructions: ${customInstruction}`;
    }
    
    // Add instruction to handle potentially incomplete content
    systemMessage += ' If the content appears to be cut off or incomplete, mention this in your summary.';
    
    // Limit content length to avoid token limits
    const maxContentLength = 15000; // Approximately 3750 tokens
    let trimmedContent = content;
    
    if (content.length > maxContentLength) {
      trimmedContent = content.substring(0, maxContentLength) + '... [Content truncated due to length]';
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: `Summarize this text: ${trimmedContent}`
          }
        ],
        temperature: 0.5, // Lower temperature for more focused summaries
        max_tokens: 1000  // Limit response length
      })
    });

    const data = await response.json();
    
    if (data.error) {
      // Handle specific API errors
      if (data.error.code === 'context_length_exceeded') {
        throw new Error('The content is too long to summarize. Try a different page or model.');
      } else {
        throw new Error(`OpenAI API error: ${data.error.message || 'Unknown error'}`);
      }
    }
    
    // Check if we have a valid response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Received an invalid response from the OpenAI API.');
    }
    
    return { 
      success: true, 
      summary: data.choices[0].message.content,
      contentLength: content.length, // Include content stats for debugging
      truncated: content.length > maxContentLength
    };
  } catch (error) {
    console.error('Summarization error:', error);
    throw error;
  }
}

/**
 * Handles chat requests by calling the OpenAI API
 */
async function handleChat(content, message, apiKey, model, customInstruction) {
  try {
    // Check if content is too short or empty
    if (!content || content.trim().length < 100) {
      throw new Error('Not enough content was extracted from the page. The page might be protected or have limited accessible text.');
    }
    
    // Default system message
    let systemMessage = 'You are a helpful assistant answering questions about an article. Provide clear, unbiased responses.';
    
    // If custom instruction is provided, append it to the system message
    if (customInstruction && customInstruction.trim()) {
      systemMessage += ` Additionally, follow these specific instructions: ${customInstruction}`;
    }
    
    // Add instruction to handle potentially incomplete content
    systemMessage += ' If you cannot answer the question based on the provided content, explain why and suggest what information might be missing.';
    
    // Limit content length to avoid token limits
    const maxContentLength = 15000; // Approximately 3750 tokens
    let trimmedContent = content;
    
    if (content.length > maxContentLength) {
      trimmedContent = content.substring(0, maxContentLength) + '... [Content truncated due to length]';
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: `Article content: ${trimmedContent}\n\nQuestion: ${message}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (data.error) {
      // Handle specific API errors
      if (data.error.code === 'context_length_exceeded') {
        throw new Error('The content is too long to process. Try a different page or model.');
      } else {
        throw new Error(`OpenAI API error: ${data.error.message || 'Unknown error'}`);
      }
    }
    
    // Check if we have a valid response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Received an invalid response from the OpenAI API.');
    }
    
    return { 
      success: true, 
      response: data.choices[0].message.content,
      contentLength: content.length, // Include content stats for debugging
      truncated: content.length > maxContentLength
    };
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
} 