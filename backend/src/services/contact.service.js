
exports.contact = async ({ name, email, phone, message }) => {
    const hash = await bcrypt.hash(password, 10);
  
    await db.query(
      'INSERT INTO contact (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email, phone, message]
    );
  };