const multer = require("multer");
const path = require("path");
const { ensureDirectoryExists } = require("./utils/fileSystem");

// Ensure uploads directory exists
ensureDirectoryExists(path.join(__dirname, "uploads"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination where the file should be stored
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split(".")[0];
    cb(
      null,
      filename.replace(/\s/g, "") + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

exports.upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB size limit
  },
});
