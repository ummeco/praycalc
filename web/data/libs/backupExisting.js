// libs/backupExisting.js
const fs = require('fs').promises;
const path = require('path');
const { format } = require('date-fns');

// Create a backup folder with timestamp
async function createBackupFolder() {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
  let folderName = `backup/${timestamp}`;
  let folderIndex = 0;

  // Add an index to the name if necessary
  while (await fs.stat(folderName).catch(() => null)) {
    folderIndex++;
    folderName = `backup/${timestamp}_${String.fromCharCode(97 + folderIndex)}`;
  }

  // Create the 'backup' directory if it does not already exist
  await fs.mkdir('backup', { recursive: true });

  // Create the backup folder
  await fs.mkdir(folderName);
  return folderName;
}

// Move existing JSON files to the backup folder
async function backupExisting() {
  const dataPath = 'data';
  const files = await fs.readdir(dataPath);
  const jsonFiles = files.filter(file => path.extname(file) === '.json');

  // Check if there are any JSON files to backup
  if (jsonFiles.length === 0) {
    console.log('No JSON files found to backup.\n');
    return;
  }

  const backupFolder = await createBackupFolder();

  // Move each JSON file to the backup folder
  for (const file of jsonFiles) {
    const oldPath = path.join(dataPath, file);
    const newPath = path.join(backupFolder, file);
    await fs.rename(oldPath, newPath);
  }

  console.log('Existing JSON files backed up to:', backupFolder, '\n');
}

module.exports = backupExisting;
