const uploadService = require("../services/upload.service");
const filesService = require("../services/file.service")
const path = require("path");
const fs = require("fs");

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

exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Get file from DB
    const file = await filesService.getFileById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // 2️⃣ Delete file from disk
    const filePath = path.join(__dirname, "../../uploads", 
      file.file_type === "image" ? "images" : "videos",
      file.filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 3️⃣ Delete from DB
    await filesService.deleteFile(id);

    res.json({ message: "File deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};