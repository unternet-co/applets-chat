const fs = require('fs');
const path = require('path');

const applets = fs
  .readdirSync(path.join(__dirname, '..', 'applets', 'dist'), {
    withFileTypes: true,
  })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => path.join(__dirname, '..', 'applets', 'dist', dirent.name));

// Create the destination directory if it doesn't exist
const destDir = 'web/public/applets';
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
} else {
  // Remove existing contents of the destination directory
  removeDirectoryContents(destDir);
}

const manifestApplets = [];

// Copy each applet and build the manifest
applets.forEach((appletPath) => {
  const appletName = path.basename(appletPath);
  const sourcePath = path.resolve(appletPath);
  const destPath = path.join(destDir, appletName);

  copyFolderRecursiveSync(sourcePath, destPath);
  console.log(`Copied ${appletName} to ${destPath}`);

  manifestApplets.push(appletName);
});

// Create the manifest.json file
const manifestPath = path.join(destDir, 'manifest.json');
const manifestContent = JSON.stringify({ applets: manifestApplets }, null, 2);

fs.writeFile(manifestPath, manifestContent, (err) => {
  if (err) {
    console.error('Error writing manifest.json:', err);
  } else {
    console.log(`Created manifest.json in ${manifestPath}`);
  }
});

function removeDirectoryContents(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      removeDirectoryContents(filePath);
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  }
}

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}
