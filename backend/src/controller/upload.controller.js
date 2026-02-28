const uploadService = require("../services/upload.service");
const filesService = require("../services/file.service")
const path = require("path");
const fs = require("fs");

const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const originalPath = req.file.path;
    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase();

    let finalFilename = req.file.filename;
    let mimetype = req.file.mimetype;

    // If .mov -> convert to .mp4
    if (ext === ".mov") {
      const mp4Name = `${Date.now()}-${path.parse(originalName).name}.mp4`;
      const mp4Path = path.join(path.dirname(originalPath), mp4Name);

      await new Promise((resolve, reject) => {
        ffmpeg(originalPath)
          .output(mp4Path)
          .on("end", () => resolve())
          .on("error", (err) => reject(err))
          .run();
      });

      // remove original .mov file
      fs.unlinkSync(originalPath);

      finalFilename = mp4Name;
      mimetype = "video/mp4"; // update
    }

    const fileType = mimetype.startsWith("image") ? "image" : "video";

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? `https://${req.get("host")}`
        : `${req.protocol}://${req.get("host")}`;

    const url = `${baseUrl}/uploads/${fileType}s/${finalFilename}`;

    // Save metadata
    const fileData = {
      filename: finalFilename,
      originalName: originalName,
      mimetype,
      size: fs.statSync(path.join(path.dirname(originalPath), finalFilename)).size,
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
    console.error(error);
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