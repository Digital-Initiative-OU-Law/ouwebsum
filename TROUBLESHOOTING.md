# OU Websum Troubleshooting Guide

This guide addresses specific issues with the OU Websum extension.

## Disabled "Summarize Page" Button

If the "Summarize Page" button remains disabled (grayed out) even after entering an API key:

1. **Check Chrome Storage**
   - Open the extension's storage-test.html page in Chrome
   - This page will show if your API key is being properly saved
   - If no data appears, there may be an issue with Chrome's storage API

2. **Manual Storage Reset**
   - Go to `chrome://extensions/`
   - Find OU Websum and click "Details"
   - Click "Clear site data"
   - Reload the extension and try entering your API key again

3. **Check Console for Errors**
   - Right-click on the extension popup and select "Inspect"
   - Look for any error messages in the Console tab
   - Pay attention to any errors related to storage or permissions

4. **Verify Permissions**
   - Go to `chrome://extensions/`
   - Find OU Websum and click "Details"
   - Ensure "Site access" is set to "On all sites" or at least the sites you want to summarize

## Settings Button Not Working

If clicking the settings (gear) icon doesn't open the settings modal:

1. **Check Console for Errors**
   - Right-click on the extension popup and select "Inspect"
   - Look for any error messages in the Console tab when you click the settings button
   - Check if there are any JavaScript errors preventing the modal from opening

2. **Verify Modal HTML**
   - In the inspector, check if the modal HTML exists in the DOM
   - Look for an element with ID "settingsModal"
   - Verify it has the correct CSS styles (display: none initially)

3. **Try Manual Activation**
   - In the console, try running:
     ```javascript
     document.getElementById('settingsModal').style.display = 'flex';
     ```
   - This should manually open the modal if the HTML is correct

## Content Script Issues

If you're getting errors about the content script not being loaded:

1. **Verify Content Script Injection**
   - Open a web page and check the console for "OU Websum content script loaded" message
   - If you don't see this message, the content script isn't being properly injected

2. **Check Manifest Configuration**
   - Ensure the manifest.json correctly lists content_scripts with appropriate matches
   - Verify the content script path is correct

3. **Try on Different Pages**
   - Some pages may block content script injection
   - Try the extension on simple pages like the included test.html

## Complete Reset Procedure

If all else fails, try this complete reset procedure:

1. Uninstall the extension completely
2. Clear Chrome's browsing data (Settings > Privacy and security > Clear browsing data)
   - Select "Cookies and site data" and "Cached images and files"
   - Set time range to "All time"
   - Click "Clear data"
3. Restart Chrome completely
4. Load the extension again from the dist directory
5. Test with the included test.html page first

## Debugging Mode

For advanced troubleshooting, you can enable debugging mode:

1. Open the extension popup
2. Open Chrome DevTools (right-click > Inspect)
3. In the console, enter:
   ```javascript
   localStorage.setItem('ouWebsumDebug', 'true');
   ```
4. Reload the extension popup
5. Now detailed debug logs will appear in the console

If you continue to experience issues after trying these steps, please report the specific error messages you're seeing. 