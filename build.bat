@echo off
echo Building OU Websum extension...

REM Create dist directory if it doesn't exist
if not exist dist mkdir dist

REM Copy manifest.json
copy /Y manifest.json dist\manifest.json
echo Copied manifest.json

REM Copy content script
copy /Y content.js dist\content.js
echo Copied content.js

REM Copy background script - prioritize root file over src file
if exist background.js (
  copy /Y background.js dist\background.js
  echo Copied background.js from root
) else if exist src\background.js (
  copy /Y src\background.js dist\background.js
  echo Copied background.js from src
)

REM Copy popup.js
if exist src\popup.js (
  copy /Y src\popup.js dist\popup.js
  echo Copied popup.js from src
) else if exist popup.js (
  copy /Y popup.js dist\popup.js
  echo Copied popup.js from root
)

REM Copy HTML files
if exist src\index.html (
  copy /Y src\index.html dist\index.html
  echo Copied index.html from src
) else if exist index.html (
  copy /Y index.html dist\index.html
  echo Copied index.html from root
)

REM Copy test files
if exist test.html (
  copy /Y test.html dist\test.html
  echo Copied test.html
)

if exist storage-test.html (
  copy /Y storage-test.html dist\storage-test.html
  echo Copied storage-test.html
)

REM Copy README.md
copy /Y README.md dist\README.md
echo Copied README.md

REM Copy TESTING.md if it exists
if exist TESTING.md (
  copy /Y TESTING.md dist\TESTING.md
  echo Copied TESTING.md
)

REM Copy icons directory
if exist icons (
  if not exist dist\icons mkdir dist\icons
  copy /Y icons\*.* dist\icons\
  echo Copied icons
)

echo Build completed successfully!
echo Extension is ready in the dist directory. 