const { uploadImage, getOptimizedUrl } = require('../services/cloudinary.service');

async function uploadController(req, res) {
  try {
    if (!req.body.imageUrl) {
      return res.status(400).json({ message: 'No image URL provided' });
    }

    const publicId = `uploads/${Date.now()}`;
    const result = await uploadImage(req.body.imageUrl, publicId);

    const optimizedUrl = getOptimizedUrl(publicId, { width: 500, height: 500, crop: 'auto', gravity: 'auto' });

    return res.json({ uploaded: result, optimizedUrl });
  } catch (error) {
    return res.status(500).json({ message: 'Upload failed', error: error.message });
  }
}

module.exports = uploadController;