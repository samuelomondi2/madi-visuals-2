const fileModel = require("./file.service");

exports.generateFileUrl = (req, file) => {
  const fileType = file.mimetype.startsWith("image")
    ? "images"
    : "videos";

  return {
    url: `${req.protocol}://${req.get("host")}/uploads/${fileType}/${file.filename}`,
    fileType: fileType === "images" ? "image" : "video",
  };
};

exports.saveFileMetadata = async (fileData) => {
  return await fileModel.insertFile(fileData);
};