
const contactService = require("../services/contact.service");
const mailer = require("../middleware/mailer");

// exports.contact = async (req, res, next) => {
//     try {
//         await contactService.contact(req.body);

//         await mailer.sendEmail({
//           to: email,
//           subject: "New Contact Message",
//           text: `Message from ${name} (${phone}): ${message}`,
//           html: `<p>Message from <strong>${name}</strong> (${phone}):</p><p>${message}</p>`
//         });

//         res.status(201).json({ message: 'Contact info created successfully' })
//     } catch (error) {
//         next(error)
//     }
// }

exports.contact = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body; 

    await contactService.contact({ name, email, phone, message });

    // Send email notification
    await mailer.sendEmail({
      to: email, // Or to admin email if you want notifications sent to yourself
      subject: "New Contact Message",
      text: `Message from ${name} (${phone}): ${message}`,
      html: `<p>Message from <strong>${name}</strong> (${phone}):</p><p>${message}</p>`
    });

    res.status(201).json({ message: "Contact info created successfully" });
  } catch (error) {
    next(error);
  }
};


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
    res.status(200).json({ message: 'Resolved contact', data: updatedContact });
  } catch (error) {
    next(error);
  }
};

exports.deleteContact = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await contactService.deleteContact({ id });

    res.status(200).json({
      message: "Contact soft deleted",
      data: result
    });

  } catch (error) {
    next(error);
  }
};

exports.getFilteredContacts = async (req, res, next) => {
  try {
    const { status, deleted } = req.query;

    const contacts = await contactService.getFilteredContacts({
      status,
      deleted,
    });

    res.json(contacts);
  } catch (err) {
    next(err);
  }
};

