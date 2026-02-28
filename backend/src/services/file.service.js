const db = require("../config/db");

exports.insertFile = async (fileData) => {
  const query = `
    INSERT INTO files 
    (filename, original_name, mimetype, size, file_type, url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    fileData.filename,
    fileData.originalName,
    fileData.mimetype,
    fileData.size,
    fileData.fileType,
    fileData.url,
  ];

  const [result] = await db.execute(query, values);
  return result.insertId;
};