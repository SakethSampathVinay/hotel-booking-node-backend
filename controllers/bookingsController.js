import express from "express";
import { pool } from "../database/db.js";

const bookHotel = async (req, res) => {
  const db = await pool.getConnection();

  try {
    const user = req.user;
    const {
      room_id,
      pricePerNight,
      image,
      name,
      address,
      guest_count,
      check_in,
      check_out,
      totalAmount,
    } = req.body;

    if (!room_id || !check_in || !check_out || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const result = await db.query(
      `INSERT INTO bookings (user_id, room_id, price_per_night, image, name, address, guest_count, check_in, check_out, status, created_at, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        user.id,
        room_id,
        pricePerNight || null,
        image || "",
        name || "",
        address || "",
        guest_count || null,
        check_in,
        check_out,
        "pending",
        totalAmount,
      ]
    );

    const bookingId = result.insertId.toString();
    return res.status(200).json({
      success: true,
      message: "Room booked Successfully",
      booking_id: bookingId,
    });
  } catch (error) {
    console.log("Error Booking Hotel: ", error);
    return res
      .status(400)
      .send({ success: false, message: "Error Booking the Hotel" });
  } finally {
    db.release();
  }
};

const getBookings = async (req, res) => {
  const user_id = req.query.user_id;
  const db = await pool.getConnection();
  try {
    const fetchBookings = await db.query(
      `
            SELECT * FROM bookings WHERE user_id = ?
            `,
      [user_id]
    );
    return res.status(200).json({
      success: true,
      message: "Fetching Bookings successfully",
      bookings: fetchBookings,
    });
  } catch (error) {
    console.log("Error Fetching the bookings Data: ", error);
    return res
      .status(400)
      .json({ success: false, message: "Error fetching the bookings data" });
  } finally {
    db.release();
  }
};

const cancelBooking = async (req, res) => {
  const db = await pool.getConnection();
  try {
    const bookingId = req.params.booking_id;
    const userId = req.user.id;

    const rows = await db.query(
      `SELECT * FROM bookings WHERE id = ? AND user_id = ? LIMIT 1`,
      [bookingId, userId]
    );

    const booking = rows[0];

    if (!booking) {
      return res
        .status(400)
        .json({ success: false, message: "Booking not found or unauthorized" });
    }

    if (booking.status === "Paid") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel a paid booking" });
    }

    await db.query(
      `UPDATE bookings SET status = 'Cancelled' WHERE id = ? AND user_id = ?`,
      [bookingId, userId]
    );

    return res
      .status(200)
      .json({ success: true, message: "Booking Cancelled Successfully" });
  } catch (error) {
    console.log("Error Cancelling the Booking: ", error);
    return res.status(400).json({
      success: false,
      message: `Error in Cancelling the Booking ${error}`,
    });
  } finally {
    db.release();
  }
};

const calculateBooking = async (req, res) => {
  const { room_id, roomType, guest_count, check_in, check_out } = req.body;

  if (!room_id || !roomType || !guest_count || !check_in || !check_out) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters",
    });
  }

  let db;
  try {
    db = await pool.getConnection();

    // Fetch room details
    const rows = await db.query(
      "SELECT * FROM rooms WHERE id = ? AND room_type = ?",
      [room_id, roomType]
    );
    const room = rows[0];

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // Room capacity mapping
    const roomsCapacity = {
      "Single Bed": 1,
      "Double Bed": 2,
      Suite: 4,
    };

    const capacity = roomsCapacity[roomType];
    if (!capacity) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid room type" });
    }

    // Parse dates
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      return res.status(400).json({ success: false, message: "Invalid dates" });
    }

    // Calculate rooms required and total amount
    const rooms_required = Math.ceil(guest_count / capacity);
    const pricePerNight = parseFloat(room.price_per_night);
    const total_amount = pricePerNight * nights * rooms_required;

    return res.json({
      success: true,
      message: "Booking calculated successfully",
      data: {
        room_id,
        room_type: room.room_type,
        guest_count,
        nights,
        rooms_required,
        price_per_night: pricePerNight,
        total_amount,
      },
    });
  } catch (error) {
    console.error("Error calculating booking:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    if (db) db.release();
  }
};

export { bookHotel, getBookings, cancelBooking, calculateBooking };
