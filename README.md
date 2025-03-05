## OU Web Summarizer Chrome Extension

A Chrome extension that summarizes web pages using OpenAI's API, designed specifically for the University of Oklahoma community.

### Features

- Summarize any web page with a single click
- Get both bullet points and paragraph summaries
- Customize summarization with instruction profiles
- Choose from multiple OpenAI models including GPT-4o, GPT-4o Mini, GPT-4, and GPT-3.5 Turbo
- OU-branded interface with crimson color scheme

### Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the `dist` directory from this repository
5. The extension should now appear in your Chrome toolbar

### Troubleshooting Installation

If you encounter issues during installation or usage, try these steps:

#### Extension Not Loading Properly

1. Ensure you're loading the correct `dist` directory that contains all necessary files
2. Check that the `dist` directory contains:
   - manifest.json
   - index.html
   - content.js
   - background.js
   - icons folder with icon files

#### Changes Not Reflecting After Updates

If you've made changes to the extension but don't see them after reloading:

1. Go to `chrome://extensions/`
2. Find the OU Websum extension
3. Click the "Remove" button to completely uninstall it
4. Click "Load unpacked" and select the `dist` directory again
5. Alternatively, try these steps:
   - Click the refresh icon on the extension card
   - Open a new Chrome window or restart Chrome completely
   - Clear your browser cache (Settings > Privacy and security > Clear browsing data)

#### Content Script Not Loading

If you see an error about the content script not loading:

1. Make sure the `content.js` file exists in the `dist` directory
2. Check that the manifest.json correctly references the content script
3. Try reloading the extension as described above

#### Background Script Issues

If the background script isn't working:

1. Check that `background.js` exists in the `dist` directory
2. Ensure the manifest.json correctly references the background script
3. Open Chrome DevTools for the background page by:
   - Going to `chrome://extensions/`
   - Finding OU Websum
   - Click "Details"
   - Under "Inspect views", click "background page" or "service worker"
4. Check the console for any error messages

### Usage

1. Click the OU Websum icon in your Chrome toolbar
2. Enter your OpenAI API key and save it (this is stored locally in your browser)
3. Select your preferred model
4. Click "Summarize Page" to generate a summary of the current web page
5. View the summary in both bullet point and paragraph formats

### Development

To modify the extension:

1. Make changes to the source files in the `src` directory
2. Run the build script to copy files to the `dist` directory:
   ```
   .\build.bat
   ```
3. Reload the extension in Chrome as described in the troubleshooting section

### Important Notes

- The extension requires an OpenAI API key to function
- Your API key is stored locally in your browser and is not sent anywhere except to OpenAI's API
- API usage will count against your OpenAI account limits and may incur charges
- The extension works best on text-heavy pages with readable content

### License

This project is licensed under the MIT License - see the LICENSE file for details. 
