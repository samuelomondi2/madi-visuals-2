const upload = require("../middleware/upload");
const controller = require("../controller/cloudinary.controller")

router.post("/media", upload.single("file"), controller.uploadMedia);
router.get("/hero", controller.getHero);

module.exports = router;