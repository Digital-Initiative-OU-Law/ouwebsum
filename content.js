// Simple content script for OU Websum extension
console.log("OU Websum content script loaded");
document.body.dataset.ouWebsumLoaded = "true"; // Add a marker to the page to indicate the script is loaded

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Content script received message:", request);
    
    if (request.action === 'ping') {
      console.log("Ping received, responding");
      sendResponse({ status: "ok", loaded: true });
      return true;
    }
    
    if (request.action === 'getContent') {
      try {
        // Extract content from the page
        const content = document.body.innerText || document.body.textContent || "";
        console.log("Content extracted, length:", content.length);
        sendResponse({ content: content });
      } catch (error) {
        console.error("Error extracting content:", error);
        sendResponse({ error: error.message });
      }
    }
    // Return true to indicate we'll respond asynchronously
    return true;
  }
); 