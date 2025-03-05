// Content script for AI Page Summarizer extension

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getContent') {
    // Get more meaningful content from the page
    extractPageContent()
      .then(content => sendResponse({ content }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
  return true;
});

/**
 * Extracts meaningful content from the webpage by prioritizing article content
 * and removing clutter like navigation, ads, and footers.
 * Now enhanced to handle common obstacles like modals, banners, and lazy-loaded content.
 */
async function extractPageContent() {
  // First, try to remove common obstacles
  removeObstacles();
  
  // Try to find the main content first using improved selectors
  let content = extractMainContent();
  
  // If content is too short, try scrolling to reveal lazy-loaded content
  if (!content || content.length < 1000) {
    await scrollToRevealContent();
    // Try extraction again after scrolling
    content = extractMainContent();
  }
  
  // If still no substantial content, fall back to body content
  if (!content || content.length < 1000) {
    content = extractBodyContent();
  }
  
  return content;
}

/**
 * Removes common obstacles like cookie banners, paywalls, and modals
 */
function removeObstacles() {
  // Common selectors for obstacles
  const obstacleSelectors = [
    // Cookie consent banners
    '#cookie-banner', '.cookie-banner', '.cookie-consent', '.cookies-notice', '[aria-label*="cookie"]',
    // Paywalls
    '.paywall', '.subscription-wall', '.premium-container', '.paid-content',
    // Newsletter/signup modals
    '.modal', '.popup', '.newsletter-signup', '.subscribe-form', '[role="dialog"]',
    // Fixed headers/footers that obscure content
    '.fixed-header', '.sticky-header', '.fixed-footer',
    // GDPR/Privacy notices
    '.privacy-notice', '.gdpr-banner', '.consent-banner',
    // Login walls
    '.login-wall', '.registration-wall',
    // Ads
    '.ad-container', '.advertisement', '[id*="google_ads"]', '[class*="ad-"]'
  ];
  
  // Remove elements that match these selectors
  obstacleSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Check if it's likely an obstacle (fixed position, absolute with z-index, etc.)
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' || 
            style.position === 'sticky' || 
            (style.position === 'absolute' && parseInt(style.zIndex) > 10)) {
          el.remove();
        }
      });
    } catch (e) {
      // Ignore errors for individual selectors
      console.log('Error removing obstacle:', e);
    }
  });
  
  // Remove elements with high z-index (likely modals/overlays)
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    try {
      const style = window.getComputedStyle(el);
      const zIndex = parseInt(style.zIndex);
      if (!isNaN(zIndex) && zIndex > 1000 && style.display !== 'none') {
        el.remove();
      }
    } catch (e) {
      // Ignore errors for individual elements
    }
  });
  
  // Remove body classes that might prevent scrolling
  document.body.classList.remove('no-scroll', 'modal-open', 'overflow-hidden');
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
}

/**
 * Extracts content from main article elements using improved selectors
 */
function extractMainContent() {
  // Enhanced list of selectors for main content, ordered by priority
  const mainContentSelectors = [
    // Article-specific selectors
    'article', 'article .body', 'article .content', '.article-content', '.article-body',
    // Main content areas
    '[role="main"]', 'main', '#main', '.main',
    // Content-specific classes
    '.post-content', '.entry-content', '.story-content', '.story-body',
    '.post-body', '.content-body', '.page-content',
    // Site-specific content containers
    '.story', '.post', '.article', '.blog-post',
    // Generic content containers
    '#content', '.content', '.container', '.main-content',
    // Reader view selectors
    '[itemprop="articleBody"]', '[property="articleBody"]',
    // Schema.org markup
    '[itemprop="text"]', '[property="og:description"]'
  ];
  
  // Try each selector
  for (const selector of mainContentSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      
      // Find the element with the most text content
      let bestElement = null;
      let maxLength = 0;
      
      elements.forEach(element => {
        // Skip if hidden
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return;
        }
        
        const text = element.textContent || '';
        const textLength = text.trim().length;
        
        // Calculate text density (text length / HTML length)
        const htmlLength = element.innerHTML.length;
        const textDensity = htmlLength > 0 ? textLength / htmlLength : 0;
        
        // Prioritize elements with good text density and length
        if (textLength > 500 && textDensity > 0.25 && textLength > maxLength) {
          maxLength = textLength;
          bestElement = element;
        }
      });
      
      if (bestElement) {
        return cleanText(bestElement.textContent);
      }
    } catch (e) {
      // Ignore errors for individual selectors
      console.log('Error with selector:', selector, e);
    }
  }
  
  return null;
}

/**
 * Extracts content from the body after removing non-content elements
 */
function extractBodyContent() {
  // Elements to exclude from body content
  const elementsToExclude = [
    'nav', 'header', 'footer', 'aside', 'sidebar',
    '.sidebar', '.navigation', '.menu', '.nav', '.navbar',
    '.ads', '.ad-container', '.advertisement',
    '.comments', '.comment-section', '.related-articles',
    '.recommendations', '.suggested', '.popular-posts',
    '.share-buttons', '.social-share', '.author-bio',
    'script', 'style', 'noscript', 'iframe', 'svg',
    'button', 'input', 'form', 'select', 'option'
  ];
  
  // Clone the body to avoid modifying the actual page
  const bodyClone = document.body.cloneNode(true);
  
  // Remove unwanted elements
  elementsToExclude.forEach(selector => {
    try {
      const elements = bodyClone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    } catch (e) {
      // Ignore errors for individual selectors
    }
  });
  
  // Find paragraphs with substantial content
  const paragraphs = bodyClone.querySelectorAll('p');
  let contentParagraphs = [];
  
  paragraphs.forEach(p => {
    const text = p.textContent.trim();
    // Look for paragraphs that are likely to be content (not navigation, etc.)
    if (text.length > 100 && text.split(' ').length > 20) {
      contentParagraphs.push(text);
    }
  });
  
  // If we found good paragraphs, use them
  if (contentParagraphs.length > 0) {
    return cleanText(contentParagraphs.join('\n\n'));
  }
  
  // Otherwise, use the cleaned body text
  return cleanText(bodyClone.textContent || '');
}

/**
 * Scrolls through the page to reveal lazy-loaded content
 */
async function scrollToRevealContent() {
  return new Promise(resolve => {
    // Get initial height
    const initialHeight = document.body.scrollHeight;
    let lastHeight = initialHeight;
    let scrollAttempts = 0;
    const maxScrollAttempts = 5; // Limit scrolling attempts
    
    // Function to scroll incrementally
    const scrollDown = () => {
      // Scroll down by 20% of viewport height each time
      window.scrollBy(0, window.innerHeight * 0.8);
      
      // Wait for potential content to load
      setTimeout(() => {
        // Check if page height has changed (indicating new content)
        const newHeight = document.body.scrollHeight;
        scrollAttempts++;
        
        if (newHeight > lastHeight || scrollAttempts < maxScrollAttempts) {
          // Page has grown or we haven't reached max attempts, continue scrolling
          lastHeight = newHeight;
          if (scrollAttempts < maxScrollAttempts) {
            scrollDown();
          } else {
            // Scroll back to top
            window.scrollTo(0, 0);
            resolve();
          }
        } else {
          // No new content loaded, we're done
          window.scrollTo(0, 0);
          resolve();
        }
      }, 500); // Wait 500ms between scrolls
    };
    
    // Start scrolling
    scrollDown();
  });
}

/**
 * Cleans up text by removing excessive whitespace and normalizing line breaks
 */
function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
    .replace(/\n+/g, '\n')     // Replace multiple newlines with single newline
    .replace(/\t+/g, ' ')      // Replace tabs with spaces
    .replace(/\r+/g, '')       // Remove carriage returns
    .replace(/\u00A0/g, ' ')   // Replace non-breaking spaces with regular spaces
    .replace(/\u2028/g, '\n')  // Replace line separator with newline
    .replace(/\u2029/g, '\n')  // Replace paragraph separator with newline
    .trim();
} 