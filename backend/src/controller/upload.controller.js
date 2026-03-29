const cloudinary = require("../config/cloudinary");
const filesService = require("../services/file.service");

exports.uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    // save all to DB
    const savedFiles = await Promise.all(
      results.map(file =>
        filesService.createFile({
          media_url: file.secure_url,
          media_type: file.resource_type === "video" ? "video" : "image",
          public_id: file.public_id,
          size: file.bytes
        })
      )
    );

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      data: savedFiles
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: err.message
    });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const files = await filesService.getAllFiles();

    res.status(200).json({
      success: true,
      data: files
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch files",
      error: err.message
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

    await cloudinary.uploader.destroy(file.public_id, {
      resource_type: file.media_type === "video" ? "video" : "image"
    });

    await filesService.deleteFile(id);

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};