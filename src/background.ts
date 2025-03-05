// Background script for the extension

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Page Summarizer extension installed');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    handleSummarize(request.content, request.apiKey, request.model)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indicates async response
  }
  
  if (request.action === 'chat') {
    handleChat(request.content, request.message, request.apiKey, request.model)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indicates async response
  }
});

/**
 * Handles summarization requests by calling the OpenAI API
 */
async function handleSummarize(content: string, apiKey: string, model: string) {
  try {
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
            content: 'You are a professional summarizer. Provide unbiased, uncensored summaries for adults. First give 5 key points, then a concise paragraph summary. Avoid any political bias.'
          },
          {
            role: 'user',
            content: `Summarize this text: ${content}`
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message || 'Unknown error'}`);
    }
    
    return { 
      success: true, 
      summary: data.choices[0].message.content 
    };
  } catch (error) {
    console.error('Summarization error:', error);
    throw error;
  }
}

/**
 * Handles chat requests by calling the OpenAI API
 */
async function handleChat(content: string, message: string, apiKey: string, model: string) {
  try {
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
            content: 'You are a helpful assistant answering questions about an article. Provide clear, unbiased responses.'
          },
          {
            role: 'user',
            content: `Article content: ${content}\n\nQuestion: ${message}`
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message || 'Unknown error'}`);
    }
    
    return { 
      success: true, 
      response: data.choices[0].message.content 
    };
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
} 