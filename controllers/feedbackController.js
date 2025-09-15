import express from "express";
import { pool } from "../database/db.js";

const createFeedback = async (req, res) => {
  const db = await pool.getConnection();
  try {
    const { rating, comment, room_id } = req.body;

    if (!room_id || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "room_id and rating are required",
      });
    }

    await db.query(
      `
        INSERT INTO feedbacks (room_id, rating, comment) VALUES (?, ?, ?)
        `,
      [room_id, rating, comment]
    );

    return res
      .status(201)
      .json({ success: true, message: "Feedback Posted Successfully" });
  } catch (error) {
    console.log("Error Posting Feedback: ", error);
    return res
      .status(400)
      .json({ success: false, message: "Error posting Feedback" });
  } finally {
    db.release();
  }
};

const getFeedbacks = async (req, res) => {
  const db = await pool.getConnection();
  try {
    const { room_id } = req.params;

    if (!room_id) {
      console.log("Room Id not Provided");
      return res
        .status(400)
        .json({ success: false, message: "Room id is required" });
    }

    const rows = await db.query(
      `
            SELECT id, room_id, rating, comment FROM feedbacks WHERE room_id = ?
            `,
      [room_id]
    );

    return res.status(200).json({
      success: true,
      message: "Feedbacks fetched successfully",
      feedbacks: rows,
    });
  } catch (error) {
    console.log("Error fetching the feedbacks", error);
    return res
      .status(400)
      .json({ success: false, message: "Error fetching the feedbacks" });
  } finally {
    db.release();
  }
};

export { createFeedback, getFeedbacks };
