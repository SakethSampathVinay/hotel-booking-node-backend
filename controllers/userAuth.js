import express from "express";
import bcryptjs from "bcryptjs";
import createUser from "../models/auth.js";
import jwt from "jsonwebtoken";
import { pool } from "../database/db.js";

const signup = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const db = await pool.getConnection();

  if (!name || !email || !phone || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  try {
    const existingEmail = await db.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (existingEmail.length > 0) {
      db.release();
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)`,
      [name, email, phone, hashedPassword]
    );

    const userId = result.insertId.toString();

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    db.release();
    res.status(200).json({
      success: true,
      message: "User Created Successfully",
      token,
      user: userId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email already exists. Please login.",
      });
    }
    db.release();
    console.log("Signup Error: ", error);
    res.json({ success: false, message: "Error Signup" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const db = await pool.getConnection();

  if (!email || !password) {
    db.release();
    return res.json({ success: false, message: "All Fields are required" });
  }

  try {
    const users = await db.query(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    console.log(users);

    if (users.length == 0) {
      db.release();
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const user = users[0];
    console.log(user);

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      db.release();
      res.json({ success: false, message: "Incorrect Password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    db.release();

    res.status(200).json({
      success: true,
      message: "User Logged Successfully",
      token,
      user: user,
    });
  } catch (error) {
    db.release();
    console.log("Error: ", error);
    res.json({ success: false, message: "Error Logging In." });
  }
};

export { signup, login };
