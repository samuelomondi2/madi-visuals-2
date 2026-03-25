const cloudinary = require("../config/cloudinary");
const db = require("../config/db");

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;

    const isVideo = file.mimetype.startsWith("video");

    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: isVideo ? "video" : "image",
        folder: "madi-visuals",
      },
      async (error, result) => {
        if (error) throw error;

        await db.execute(
          "INSERT INTO media (media_url, media_type, public_id) VALUES (?, ?, ?)",
          [result.secure_url, isVideo ? "video" : "image", result.public_id]
        );

        res.json({
          url: result.secure_url,
          type: isVideo ? "video" : "image",
        });
      }
    );

    result.end(file.buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};