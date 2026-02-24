
const contactService = require("../services/contact.service");

exports.contact = async (req, res, next) => {
    try {
        await contactService.contact(req.body);
        res.status(201).json({ message: 'Contact info created successfully' })
    } catch (error) {
        next(error)
    }
}

exports.getContacts = async (req, res, next) => {
  try {
    const contacts = await contactService.getContacts();
    res.status(200).json({ contacts });
  } catch (error) {
    next(error);
  }
};