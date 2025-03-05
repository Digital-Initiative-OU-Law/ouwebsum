# OU Websum Extension Testing Guide

This document provides step-by-step instructions for testing the OU Websum Chrome extension after making changes.

## Complete Testing Process

1. **Build the extension**
   ```
   .\build.bat
   ```
   This will copy all necessary files to the `dist` directory.

2. **Completely remove the existing extension**
   - Go to `chrome://extensions/`
   - Find the OU Websum extension
   - Click "Remove" to uninstall it completely

3. **Clear Chrome's cache**
   - Go to Chrome Settings > Privacy and security > Clear browsing data
   - Select "Cached images and files"
   - Click "Clear data"

4. **Load the extension again**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `dist` directory

5. **Test the extension on a web page**
   - Open the included `test.html` file in Chrome, or navigate to any content-rich web page
   - Click the OU Websum extension icon in the toolbar
   - Enter your OpenAI API key and save it
   - Select a model (GPT-4o, GPT-4o Mini, etc.)
   - Click "Summarize Page"
   - Verify that the summary appears with both bullet points and paragraph format

## Verifying UI Changes

The extension should now have:
- OU Crimson color scheme (#841617) for the header, buttons, and other UI elements
- Updated model options including GPT-4o and GPT-4o Mini

## Troubleshooting

If the extension still doesn't work correctly:

1. **Check the console for errors**
   - Right-click on the extension popup and select "Inspect"
   - Look for any error messages in the Console tab

2. **Verify background script**
   - Go to `chrome://extensions/`
   - Find OU Websum and click "Details"
   - Under "Inspect views", click "service worker"
   - Check the console for any error messages

3. **Test with a simple page**
   - Use the included `test.html` file which has plenty of content for summarization

4. **Restart Chrome completely**
   - Close all Chrome windows and reopen

5. **Try in Incognito mode**
   - Enable the extension in Incognito mode from the extension details page
   - Test in an Incognito window to rule out conflicts with other extensions

## Expected Behavior

When working correctly, the extension should:
1. Extract text content from the current web page
2. Send this content to the OpenAI API using your API key
3. Display a loading spinner while processing
4. Show the summary with bullet points and a paragraph when complete

If you encounter persistent issues, please check the README.md file for additional troubleshooting steps. 