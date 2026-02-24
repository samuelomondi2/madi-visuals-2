
const contactService = require("../services/contact.service");

exports.contact = async (req, res, next) => {
    try {
        await contactService.contact(req.body);
        res.status(201).json({ message: 'Contact info created successfully' })
    } catch (error) {
        next(error)
    }
}
