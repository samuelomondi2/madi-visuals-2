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

exports.updateHero = async (req, res, next) => {
  try {
    const { id } = req.params;
    await heroService.updateHero({ id, ...req.body });
    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    next(error);
  }
};