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
    const hero_section = await heroService.getHero();

    if (!hero_section) {
      return res.status(404).json({ message: "No hero found" });
    }

    res.json({ hero_section });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hero" });
  }
};

// Update text
exports.updateHeroContent = async (req, res) => {
  try {
    const { id } = req.params;
    await heroService.updateHeroContent({ id, ...req.body });

    res.json({ message: "Hero content updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update hero content" });
  }
};

// Update image (latest uploaded image)
exports.updateHeroImage = async (req, res) => {
  try {
    await heroService.updateHeroWithLatestImage();
    res.json({ message: "Hero image updated using latest upload" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};