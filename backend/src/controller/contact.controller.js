
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

exports.reviewedContact = async (req, res, next) => {
  const { id } = req.params;
  try {
    const updatedContact = await contactService.reviewdContact({ id });
    res.status(200).json({ message: 'Resolved', data: updatedContact });
  } catch (error) {
    next(error);
  }
};
