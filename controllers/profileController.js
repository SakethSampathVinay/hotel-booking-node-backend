import express from "express";
import { pool } from "../database/db.js";

const getProfile = async (req, res) => {
  const db = await pool.getConnection();
  try {
    const { user_id } = req.params;

    const rows = await db.query(
      `
      SELECT name, email, phone FROM users WHERE id = ?
      `,
      [user_id]
    );

    const profile = rows[0];

    return res.status(200).json({
      success: true,
      message: "User Profile fetched successfully",
      profile,
    });
  } catch (error) {
    console.log("Error getting profile: ", error);
    return res.status(400).json({ success: false, message: `Error: ${error}` });
  } finally {
    db.release();
  }
};

const updateProfile = async (req, res) => {
  const db = await pool.getConnection();
  try {
    const { user_id } = req.params;
    const { email, phone } = req.body;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "user_id not provided" });
    }

    const rows = await db.query(
      `
            UPDATE users SET email = ?, phone = ? WHERE id = ?
            `,
      [email, phone, user_id]
    );

    const updatingProfile = rows[0];

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      updatingProfile,
    });
  } catch (error) {
    console.error("Error updating the profile", error);
    return res
      .status(400)
      .json({ success: false, message: `Error updating: ${error}` });
  } finally {
    db.release();
  }
};

const deleteProfile = async (req, res) => {
  const db = await pool.getConnection();
  try {
    const { user_id } = req.params;

    const bookings = await db.query(
      "SELECT * FROM bookings WHERE user_id = ?",
      [user_id]
    );

    if (bookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user with active bookings",
      });
    }

    const rows = await db.query(
      `
        DELETE FROM users WHERE id = ?;
        `,
      [user_id]
    );

    const deletingProfile = rows[0];

    return res.status(200).json({
      success: true,
      message: "Profile Deleted Successfully",
      deletingProfile,
    });
  } catch (error) {
    console.error("Error deleting the profile", error);
    return res.status(400).json({
      success: false,
      message: `Error deleting the profile: ${error}`,
    });
  } finally {
    db.release();
  }
};

export { getProfile, updateProfile, deleteProfile };
