const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL;

exports.sendBookingEmails = async (data) => {

  // ✅ 1. Email to Admin
  await resend.emails.send({
    from: "Booking System <onboarding@resend.dev",
    to: adminEmail,
    subject: `${data.client_name} booked a session`,
    html: `
      <h2>New Booking</h2>
      <p><strong>Name:</strong> ${data.client_name}</p>
      <p><strong>Email:</strong> ${data.client_email}</p>
      <p><strong>Phone:</strong> ${data.client_phone || "-"}</p>
      <p><strong>Location:</strong> ${data.location || "-"}</p>
      <p><strong>Date:</strong> ${data.booking_date}</p>
      <p><strong>Time:</strong> ${data.start_time}</p>
      <p><strong>Notes:</strong></p>
      <p>${data.notes || "-"}</p>
    `,
    reply_to: data.client_email, 
  });

  // ✅ 2. Confirmation Email to Client
  await resend.emails.send({
    from: "Booking System <nonboarding@resend.dev>",
    to: data.client_email,
    subject: "Your booking is confirmed",
    html: `
      <p>Hi ${data.client_name},</p>

      <p>Your booking has been received successfully.</p>

      <h3>Booking Details:</h3>
      <p><strong>Date:</strong> ${data.booking_date}</p>
      <p><strong>Time:</strong> ${data.start_time}</p>
      <p><strong>Location:</strong> ${data.location || "-"}</p>

      <br/>
      <p>We’ll contact you shortly if needed.</p>

      <p>Thanks,<br/>Madi Visual</p>
    `,
  });
};

exports.sendContactMessagesEmails = async ({ name, email, phone, message }) => {

    await resend.emails.send({
      from: "Contact System <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New Contact Message`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "-"}</p>
        <p><strong>Notes:</strong></p>
        <p>${message || "-"}</p>
      `,
      reply_to: email, 
    });
  
    await resend.emails.send({
      from: "Contact System <onboarding@resend.dev>",
      to: email,
      subject: "We received your message",
      html: `
        <p>Hi ${name},</p>
  
        <p>Your booking has been received successfully.</p>
  
        <h3>Contact Details:</h3>
        <p>Thanks for reaching out! We've received your message and will get back to you shortly.</p>
    
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
    
        <br/>
        <p>Best regards,<br/>Madi Visuals</p>
      `,
    });
  };