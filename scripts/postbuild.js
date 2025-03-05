// Post-build script for Chrome extension
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

async function main() {
  try {
    console.log('Running post-build script...');
    
    // Ensure dist directory exists
    await fs.ensureDir(distDir);
    
    // Copy manifest.json to dist
    await fs.copy(
      path.resolve(rootDir, 'manifest.json'),
      path.resolve(distDir, 'manifest.json')
    );
    console.log('✓ Copied manifest.json');
    
    // Copy icons to dist
    await fs.copy(
      path.resolve(rootDir, 'icons'),
      path.resolve(distDir, 'icons')
    );
    console.log('✓ Copied icons');
    
    // Copy src/index.html to dist/index.html (overwriting the React-generated one if it exists)
    if (await fs.pathExists(path.resolve(rootDir, 'src/index.html'))) {
      await fs.copy(
        path.resolve(rootDir, 'src/index.html'),
        path.resolve(distDir, 'index.html'),
        { overwrite: true }
      );
      console.log('✓ Copied src/index.html to dist/index.html');
    }
    
    // Copy src/content.js to dist/content.js if it exists (prioritize this over the built version)
    if (await fs.pathExists(path.resolve(rootDir, 'src/content.js'))) {
      await fs.copy(
        path.resolve(rootDir, 'src/content.js'),
        path.resolve(distDir, 'content.js'),
        { overwrite: true }
      );
      console.log('✓ Copied src/content.js to dist/content.js');
    }
    // Otherwise, ensure the built content.js is in the right place
    else if (!await fs.pathExists(path.resolve(distDir, 'content.js')) && await fs.pathExists(path.resolve(distDir, 'content.js'))) {
      // This is already handled by Vite, but just in case
      console.log('✓ content.js already exists in dist');
    }
    
    // Handle background.js
    if (await fs.pathExists(path.resolve(rootDir, 'src/background.js'))) {
      await fs.copy(
        path.resolve(rootDir, 'src/background.js'),
        path.resolve(distDir, 'background.js'),
        { overwrite: true }
      );
      console.log('✓ Copied src/background.js to dist/background.js');
    }
    else if (!await fs.pathExists(path.resolve(distDir, 'background.js')) && await fs.pathExists(path.resolve(distDir, 'background.js'))) {
      // This is already handled by Vite, but just in case
      console.log('✓ background.js already exists in dist');
    }
    
    console.log('Post-build completed successfully!');
  } catch (err) {
    console.error('Error during post-build:', err);
    process.exit(1);
  }
}

main(); 