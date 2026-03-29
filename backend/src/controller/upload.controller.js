const cloudinary = require("../config/cloudinary");
const filesService = require("../services/file.service");
const fs = require("fs");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto"
    });

    // remove local file
    fs.unlinkSync(req.file.path);

    // detect type
    const mediaType = result.resource_type === "video" ? "video" : "image";

    // save to DB
    const savedFile = await filesService.createFile({
      media_url: result.secure_url,
      media_type: mediaType,
      public_id: result.public_id,
      size: result.bytes
    });

    res.status(200).json({
      success: true,
      message: "File uploaded",
      data: savedFile
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Upload failed"
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await filesService.getFileById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // delete from cloudinary
    await cloudinary.uploader.destroy(file.public_id, {
      resource_type: file.media_type === "video" ? "video" : "image"
    });

    // delete from DB
    await filesService.deleteFile(id);

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};