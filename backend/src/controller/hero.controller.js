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
exports.getHero = async (req, res, next) => {
  try {
    const hero = await heroService.getHero();
    res.status(200).json({ hero });
  } catch (error) {
    next(error);
  }
};

// Update text content
exports.updateHeroContent = async (req, res) => {
  try {
    const { id } = req.params;

    await heroService.updateHeroContent({
      id,
      ...req.body,
    });

    res.json({ message: "Hero content updated successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update hero content",
      error: error.message,
    });
  }
};

// Update image
exports.updateHeroImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ message: "fileId is required" });
    }

    await heroService.updateHeroImage(id, fileId);

    res.json({ message: "Hero image updated successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update hero image",
      error: error.message,
    });
  }
};