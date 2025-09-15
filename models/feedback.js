import { pool } from "../database/db.js";

const createFeedbackTable = async () => {
  const db = await pool.getConnection();

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        rating TINYINT NOT NULL,
        comment TEXT,
        FOREIGN KEY (room_id) REFERENCES rooms(id)
      )
    `);
    console.log("Feedback table created or already exists");
  } catch (error) {
    console.error("Error creating feedback table: ", error);
  } finally {
    db.release();
  }
};

export default createFeedbackTable;
