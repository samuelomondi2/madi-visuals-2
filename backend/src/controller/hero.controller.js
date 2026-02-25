const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

exports.getHero = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM hero_section ORDER BY updated_at DESC LIMIT 1"
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Hero not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateHeroText = async (req, res) => {
  try {
    const { title, description } = req.body;

    await db.execute(
      "UPDATE hero_section SET title=?, name=?, description=? WHERE id=1",
      [title, name, description]
    );

    res.json({ message: "Hero text updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "hero_section",
        resource_type: "auto",
      },
      async (error, result) => {
        if (error) return res.status(500).json({ error: error.message });

        await db.execute(
          "UPDATE hero_section SET media_url=? WHERE id=1",
          [result.secure_url]
        );

        res.json({ media_url: result.secure_url });
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};