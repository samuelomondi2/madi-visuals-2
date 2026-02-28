const heroService = require("../services/hero.services");

exports.hero = async (req, res, next) => {
  try {
      await heroService.hero(req.body);
      res.status(201).json({ message: 'Hero info created successfully' })
  } catch (error) {
      next(error)
  }
}

exports.getHero = async (req, res, next) => {
try {
  const hero_section = await heroService.getHero();
  res.status(200).json({ hero_section });
} catch (error) {
  next(error);
}
};

exports.updateHero = async (req, res) => {
  const { heroUrl } = req.body;
  try {
    await db.execute("UPDATE hero SET url=? WHERE id=1", [heroUrl]);
    res.status(200).json({ message: "Hero updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};