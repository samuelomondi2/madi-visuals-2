const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(), // ✅ no disk
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

module.exports = upload;