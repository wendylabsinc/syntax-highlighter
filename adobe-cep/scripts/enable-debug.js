/**
 * Enable CEP debug mode
 *
 * This script sets the PlayerDebugMode flag to enable loading unsigned extensions.
 * Required for local development.
 *
 * macOS: defaults write com.adobe.CSXS.12 PlayerDebugMode 1
 * Windows: Registry key
 */

const { execSync } = require('child_process');
const os = require('os');

const CEP_VERSIONS = ['12', '11', '10', '9', '8'];

function enableDebugMac() {
  console.log('Enabling CEP debug mode on macOS...\n');

  for (const version of CEP_VERSIONS) {
    try {
      execSync(`defaults write com.adobe.CSXS.${version} PlayerDebugMode 1`, { stdio: 'inherit' });
      console.log(`  CSXS.${version}: Enabled`);
    } catch (e) {
      // Ignore errors for versions that don't exist
    }
  }

  console.log('\nDebug mode enabled!');
  console.log('Restart After Effects for changes to take effect.');
}

function enableDebugWindows() {
  console.log('Enabling CEP debug mode on Windows...\n');

  for (const version of CEP_VERSIONS) {
    try {
      const regPath = `HKCU\\Software\\Adobe\\CSXS.${version}`;
      execSync(`reg add "${regPath}" /v PlayerDebugMode /t REG_SZ /d 1 /f`, { stdio: 'inherit' });
      console.log(`  CSXS.${version}: Enabled`);
    } catch (e) {
      // Ignore errors for versions that don't exist
    }
  }

  console.log('\nDebug mode enabled!');
  console.log('Restart After Effects for changes to take effect.');
}

function main() {
  const platform = os.platform();

  if (platform === 'darwin') {
    enableDebugMac();
  } else if (platform === 'win32') {
    enableDebugWindows();
  } else {
    console.error('Unsupported platform:', platform);
    process.exit(1);
  }
}

main();
