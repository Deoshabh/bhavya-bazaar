const fs = require('fs');
const path = require('path');

// Ensure directory exists
exports.ensureDirectoryExists = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    try {
      fs.mkdirSync(directoryPath, { recursive: true });
      console.log(`Directory created: ${directoryPath}`);
    } catch (error) {
      console.error(`Error creating directory: ${directoryPath}`, error);
      throw new Error(`Failed to create directory: ${directoryPath}`);
    }
  }
};

// Delete file if exists
exports.deleteFileIfExists = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error(`Error deleting file: ${filePath}`, error);
      return false;
    }
  }
  return false;
};
