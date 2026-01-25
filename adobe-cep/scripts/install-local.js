/**
 * Install CEP extension locally for development
 *
 * macOS: ~/Library/Application Support/Adobe/CEP/extensions/
 * Windows: C:\Users\<USER>\AppData\Roaming\Adobe\CEP\extensions\
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const EXTENSION_ID = 'com.wendylabs.syntaxhighlighter.cep';

function getExtensionsPath() {
  const platform = os.platform();

  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'CEP', 'extensions');
  } else if (platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'Adobe', 'CEP', 'extensions');
  } else {
    throw new Error('Unsupported platform: ' + platform);
  }
}

function createSymlink() {
  const extensionsPath = getExtensionsPath();
  const targetPath = path.join(extensionsPath, EXTENSION_ID);
  const sourcePath = path.resolve(__dirname, '..');

  // Create extensions directory if it doesn't exist
  if (!fs.existsSync(extensionsPath)) {
    fs.mkdirSync(extensionsPath, { recursive: true });
    console.log('Created extensions directory:', extensionsPath);
  }

  // Remove existing symlink or directory
  if (fs.existsSync(targetPath)) {
    const stats = fs.lstatSync(targetPath);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(targetPath);
      console.log('Removed existing symlink');
    } else {
      console.error('Error: Target path exists and is not a symlink:', targetPath);
      console.error('Please remove it manually and try again.');
      process.exit(1);
    }
  }

  // Create symlink
  fs.symlinkSync(sourcePath, targetPath, 'junction');
  console.log('Created symlink:');
  console.log('  From:', targetPath);
  console.log('  To:', sourcePath);
  console.log('\nExtension installed successfully!');
  console.log('Restart After Effects to load the extension.');
}

try {
  createSymlink();
} catch (error) {
  console.error('Installation failed:', error.message);
  process.exit(1);
}
