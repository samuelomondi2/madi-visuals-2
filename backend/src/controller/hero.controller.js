const heroService = require("../services/hero.services");

// Create
exports.createHero = async (req, res, next) => {
  try {
    await heroService.createHero(req.body);
    res.status(201).json({ message: "Hero created successfully" });
  } catch (error) {
    next(error);
  }
};

// Get
exports.getHero = async (req, res) => {
  try {
    const hero_section = await require("../services/hero.services").getHero();
    if (!hero_section) {
      return res.status(404).json({ message: "No hero found" });
    }
    res.json({ hero_section });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch hero", error: error.message });
  }
};

// Update text content
exports.updateHeroImage = async (req, res) => {
  try {
    // Get latest hero
    const [heroRows] = await db.execute(`
      SELECT id 
      FROM hero_section 
      ORDER BY updated_at DESC 
      LIMIT 1
    `);

    if (!heroRows.length) {
      return res.status(404).json({ message: "No hero found" });
    }

    const heroId = heroRows[0].id;

    // Get latest uploaded file (image only)
    const [fileRows] = await db.execute(`
      SELECT id 
      FROM files 
      WHERE file_type = 'image'
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    if (!fileRows.length) {
      return res.status(404).json({ message: "No image file found" });
    }

    const fileId = fileRows[0].id;

    // Update hero_section
    await db.execute(
      `UPDATE hero_section 
       SET hero_file_id = ? 
       WHERE id = ?`,
      [fileId, heroId]
    );

    res.json({ message: "Hero image updated using latest uploaded image" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update hero image" });
  }
};

// Update image

exports.updateHeroImage = async (req, res) => {
  try {
    const { id } = req.params;       // hero_section.id
    const { fileId } = req.body;     // files.id

    if (!fileId) {
      return res.status(400).json({ message: "fileId is required" });
    }

    // Check if hero exists
    const [heroRows] = await db.execute(
      "SELECT * FROM hero_section WHERE id = ?",
      [id]
    );

    if (!heroRows.length) {
      return res.status(404).json({ message: "Hero not found" });
    }

    // Check if file exists
    const [fileRows] = await db.execute(
      "SELECT * FROM files WHERE id = ?",
      [fileId]
    );

    if (!fileRows.length) {
      return res.status(404).json({ message: "File not found" });
    }

    // Update hero_section
    await db.execute(
      "UPDATE hero_section SET hero_file_id = ? WHERE id = ?",
      [fileId, id]
    );

    res.json({ message: "Hero image updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update hero image", error: error.message });
  }
};