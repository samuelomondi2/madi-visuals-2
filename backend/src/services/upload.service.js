const fileModel = require("./file.service");

exports.generateFileUrl = (req, file) => {
    const fileType = file.mimetype.startsWith("image")
      ? "images"
      : "videos";
  
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? `https://${req.get("host")}`
        : `${req.protocol}://${req.get("host")}`;
  
    return {
      url: `${baseUrl}/uploads/${fileType}/${file.filename}`,
      fileType: fileType === "images" ? "image" : "video",
    };
  };

exports.saveFileMetadata = async (fileData) => {
  return await fileModel.insertFile(fileData);
};