import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: true,
  },
});

const connectToDB = async () => {
  try {
    let db = await pool.getConnection();
    console.log("MariaDB Connected Successfully");
    db.release();
  } catch (error) {
    console.error("Error Connecting to the Database", error);
  }
};

export { pool, connectToDB };
