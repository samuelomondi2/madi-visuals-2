const app = require('./app');
const db = require('./src/config/db');

console.log("ENV CHECK:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

// DB connection
async function startServer() {
  try {
    await db.query('SELECT 1');
    console.log(`✅ MySQL connected to database: ${process.env.DB_DATABASE}`);

    const PORT = process.env.PORT || 5500;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  }
}

startServer();



