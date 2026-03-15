
const adminEmailService = require("../services/adminEmailService");

exports.getEmailDetails = async (req, res, next) => {
  try {
    const rows = await adminEmailService.getEmailDetails();
    res.status(200).json(rows[0] || {}); 
  } catch (err) {
    next(err);
  }
};

exports.updateEmailDetails = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await adminEmailService.updateEmailDetails({ email, password });
    res.status(200).json({ message: "Admin email updated successfully" });
  } catch (err) {
    next(err);
  }
};
