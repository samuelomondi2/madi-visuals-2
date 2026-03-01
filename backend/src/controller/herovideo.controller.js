const heroVideoService = require("../controller/herovideo.controller");

exports.createHeroVideo = async (req, res, next) => {
    try {
      await heroVideoService.createHeroVideo(req.body);
      res.status(201).json({ message: "Hero Video URL created successfully" });
    } catch (error) {
      next(error);
    }
};

exports.getHeroVideo = async (req, res) => {
    try {
      res.set("Cache-Control", "no-store");
  
      const hero_video_url = await heroVideoService.getHeroVideo();
  
      if (!hero_video_url) {
        return res.status(404).json({ message: "No hero video url found" });
      }
  
      res.json({ hero_video_url });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hero video url" });
    }
  };