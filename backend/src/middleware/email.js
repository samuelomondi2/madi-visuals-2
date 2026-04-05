const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL;

exports.forgotPasswordTokenEmail = async ({ email, token }) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "MADI VISUALS <noreply@madivisuals.com>",
    to: email,
    subject: "Password Reset Requested",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; text-align: center; border-radius: 8px;">
          
          <h2 style="margin-bottom: 20px; color: #333;">
            MADI VISUALS
          </h2>

          <div style="font-size: 50px; margin: 20px 0;">🔒</div>

          <h2 style="color: #333;">
            Hi, you have requested a password reset
          </h2>

          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            A password reset has been requested for username 
            <strong>${email}</strong>. 
            Click the button below to reset your password.
            This link will expire in 1 hour.
          </p>

          <div style="margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #1a73e8; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
               Reset Password
            </a>
          </div>

          <p style="color: #777; font-size: 14px;">
            If you did not submit this password reset, please ignore this email.
          </p>

        </div>
      </div>
    `,
  });
};

exports.sendBookingEmails = async (data) => {

  const container = `
    style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px 0;"
  `;

  const card = `
    style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 8px;"
  `;

  const heading = `
    style="text-align:center; color:#333; margin-bottom:20px;"
  `;

  const label = `style="color:#555; font-weight:bold;"`;
  const text = `style="color:#333;"`;

  // ✅ 1. Email to Admin
  await resend.emails.send({
    from: "MADI VISUALS <noreply@madivisuals.com>",
    to: adminEmail,
    subject: `${data.client_name} booked a session`,
    html: `
      <div ${container}>
        <div ${card}>
          <h2 ${heading}>📸 New Booking</h2>

          <p><span ${label}>Name:</span> <span ${text}>${data.client_name}</span></p>
          <p><span ${label}>Email:</span> <span ${text}>${data.client_email}</span></p>
          <p><span ${label}>Phone:</span> <span ${text}>${data.client_phone || "-"}</span></p>
          <p><span ${label}>Location:</span> <span ${text}>${data.location || "-"}</span></p>
          <p><span ${label}>Date:</span> <span ${text}>${data.booking_date}</span></p>
          <p><span ${label}>Time:</span> <span ${text}>${data.start_time}</span></p>

          <hr style="margin:20px 0;" />

          <p ${label}>Notes:</p>
          <p ${text}>${data.notes || "-"}</p>
        </div>
      </div>
    `,
    reply_to: data.client_email,
  });

  // ✅ 2. Confirmation Email to Client
  await resend.emails.send({
    from: "MADI VISUALS <noreply@madivisuals.com>",
    to: data.client_email,
    subject: "Your booking is confirmed",
    html: `
      <div ${container}>
        <div ${card} style="text-align:center;">
          
          <h2 style="color:#333;">MADI VISUALS</h2>

          <div style="font-size:40px; margin:15px 0;">✅</div>

          <h3 style="color:#333;">Booking Confirmed</h3>

          <p style="color:#555;">
            Hi <strong>${data.client_name}</strong>,<br/>
            Your booking has been successfully received.
          </p>

          <div style="margin:20px 0; text-align:left;">
            <p><strong>Date:</strong> ${data.booking_date}</p>
            <p><strong>Time:</strong> ${data.start_time}</p>
            <p><strong>Location:</strong> ${data.location || "-"}</p>
          </div>

          <div style="margin:25px 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">
               View Booking
            </a>
          </div>

          <p style="color:#777;">
            We’ll contact you shortly if needed.
          </p>

          <p style="color:#777;">Thanks,<br/>Madi Visuals</p>

        </div>
      </div>
    `,
  });
};

exports.sendContactMessagesEmails = async ({ name, email, phone, message }) => {

  const container = `
    style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px 0;"
  `;

  const card = `
    style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 8px;"
  `;

  const heading = `
    style="text-align:center; color:#333; margin-bottom:20px;"
  `;

  const label = `style="color:#555; font-weight:bold;"`;
  const text = `style="color:#333;"`;

  // ✅ 1. Admin Email
  await resend.emails.send({
    from: "MADI VISUALS <noreply@madivisuals.com>",
    to: adminEmail,
    subject: "New Contact Message",
    html: `
      <div ${container}>
        <div ${card}>
          <h2 ${heading}>📩 New Contact Message</h2>

          <p><span ${label}>Name:</span> <span ${text}>${name}</span></p>
          <p><span ${label}>Email:</span> <span ${text}>${email}</span></p>
          <p><span ${label}>Phone:</span> <span ${text}>${phone || "-"}</span></p>

          <hr style="margin:20px 0;" />

          <p ${label}>Message:</p>
          <p ${text}>${message || "-"}</p>
        </div>
      </div>
    `,
    reply_to: email,
  });

  // ✅ 2. Auto-response to Client
  await resend.emails.send({
    from: "MADI VISUALS <noreply@madivisuals.com>",
    to: email,
    subject: "We received your message",
    html: `
      <div ${container}>
        <div ${card} style="text-align:center;">
          
          <h2 style="color:#333;">MADI VISUALS</h2>

          <div style="font-size:40px; margin:15px 0;">💬</div>

          <h3 style="color:#333;">Message Received</h3>

          <p style="color:#555;">
            Hi <strong>${name}</strong>,<br/>
            Thanks for reaching out! We've received your message and will get back to you shortly.
          </p>

          <div style="margin:20px 0; text-align:left;">
            <p><strong>Your message:</strong></p>
            <p style="color:#333;">${message}</p>
          </div>

          <div style="margin:25px 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">
               Visit Website
            </a>
          </div>

          <p style="color:#777;">Best regards,<br/>Madi Visuals</p>

        </div>
      </div>
    `,
  });
};
