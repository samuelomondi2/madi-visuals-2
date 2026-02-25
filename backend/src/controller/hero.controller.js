const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

exports.getHero = async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM hero_section LIMIT 1");
  res.json(rows[0]);
};

exports.updateHeroText = async (req, res) => {
  const { title, description } = req.body;

  await db.execute(
    "UPDATE hero_section SET title=?, description=? WHERE id=1",
    [title, description]
  );

  res.json({ message: "Hero text updated" });
};

exports.updateHeroImage = async (req, res) => {
  try {
    const file = req.file;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "hero_section",
        resource_type: "auto",
      },
      async (error, result) => {
        if (error) return res.status(500).json({ error });

        await db.execute(
          "UPDATE hero_section SET media_url=? WHERE id=1",
          [result.secure_url]
        );

        res.json({ media_url: result.secure_url });
      }
    );

    stream.end(file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};