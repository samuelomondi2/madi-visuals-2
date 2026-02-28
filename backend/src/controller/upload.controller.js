const uploadService = require("../services/upload.service");
const filesService = require("../services/file.service")

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { url, fileType } = uploadService.generateFileUrl(req, req.file);

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      fileType,
      url,
    };

    const fileId = await uploadService.saveFileMetadata(fileData);

    return res.status(201).json({
      message: "File uploaded & saved to DB",
      id: fileId,
      url,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
};


exports.getFiles = async (req, res) => {
    const files = await filesService.getAllFiles();
    res.json(files);
  };