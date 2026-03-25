const cloudinary = require("../config/cloudinary");
const db = require("../config/db");
const streamifier = require("streamifier");

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;
    const isVideo = file.mimetype.startsWith("video");

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: isVideo ? "video" : "image",
            folder: "madi-visuals",
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const result = await streamUpload();

    await db.execute(
      `INSERT INTO media 
       (media_url, media_type, public_id, original_name, size) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        result.secure_url,
        isVideo ? "video" : "image",
        result.public_id,
        file.originalname,
        file.size,
      ]
    );

    res.json({
      url: result.secure_url,
      type: isVideo ? "video" : "image",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      "SELECT public_id FROM media WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Not found" });
    }

    const publicId = rows[0].public_id;

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });

    await db.execute("DELETE FROM media WHERE id = ?", [id]);

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};