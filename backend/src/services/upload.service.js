const fileModel = require("./file.service");

exports.generateFileUrl = (req, file) => {
    const fileType = file.mimetype.startsWith("image") ? "images" : "videos";
  
    // Always use backend host
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`;
  
    return {
      url: `${baseUrl}/uploads/${fileType}/${file.filename}`,
      fileType: fileType === "images" ? "image" : "video",
    };
};

exports.saveFileMetadata = async (fileData) => {
  return await fileModel.insertFile(fileData);
};