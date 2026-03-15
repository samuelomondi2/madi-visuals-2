
const nodemailer = require("nodemailer");
const adminEmailService = require("../services/adminEmailService");

exports.sendEmail = async ({ to, subject, text, html }) => {
  const credentials = await adminEmailService.getEmailDetails();
  if (!credentials) throw new Error("Admin email credentials not found");

  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: credentials.email,
      pass: credentials.password,
    },
  });

  const info = await transporter.sendMail({
    from: credentials.email,
    to,
    subject,
    text,
    html,
  });

  return info;
};
