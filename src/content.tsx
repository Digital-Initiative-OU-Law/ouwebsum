// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getContent') {
    // Get more meaningful content from the page
    const content = extractPageContent();
    sendResponse({ content });
  }
  return true;
});

/**
 * Extracts meaningful content from the webpage by prioritizing article content
 * and removing clutter like navigation, ads, and footers.
 */
function extractPageContent() {
  // Try to find the main content first
  const mainContentSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.main-content',
    '#content',
    '.content',
    '.post',
    '.article'
  ];
  
  for (const selector of mainContentSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent && element.textContent.trim().length > 500) {
      return cleanText(element.textContent);
    }
  }
  
  // If no main content found, extract from body but try to exclude navigation, sidebars, etc.
  const elementsToExclude = [
    'nav',
    'header',
    'footer',
    'aside',
    '.sidebar',
    '.navigation',
    '.menu',
    '.ads',
    '.comments',
    'script',
    'style',
    'noscript'
  ];
  
  // Clone the body to avoid modifying the actual page
  const bodyClone = document.body.cloneNode(true) as HTMLElement;
  
  // Remove unwanted elements
  elementsToExclude.forEach(selector => {
    bodyClone.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  return cleanText(bodyClone.textContent || '');
}

/**
 * Cleans up text by removing excessive whitespace and normalizing line breaks
 */
function cleanText(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}