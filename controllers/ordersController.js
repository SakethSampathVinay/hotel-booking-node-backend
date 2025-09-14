import Razorpay from "razorpay";
import { pool } from "../database/db.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
export const createOrder = async (req, res) => {
  const db = await pool.getConnection();
  try {
    const { amount, room_id, booking_id, user_id } = req.body;
    if (!amount || !room_id || !booking_id || !user_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const paymentAmount = parseInt(amount) * 100; // in paise

    const order = await razorpay.orders.create({
      amount: paymentAmount,
      currency: "INR",
      payment_capture: 1,
    });

    const numericUserId = parseInt(user_id);
    if (isNaN(numericUserId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user_id" });
    }

    await db.query(
      `INSERT INTO orders (razorpay_order_id, amount, room_id, user_id, booking_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [order.id, paymentAmount, room_id, numericUserId, booking_id, "Created"]
    );

    res.status(200).json({ success: true, id: order.id, amount: order.amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating order" });
  } finally {
    db.release();
  }
};

// Confirm Payment
export const confirmPayment = async (req, res) => {
  const db = await pool.getConnection();
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      booking_id,
    } = req.body;

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // Update order & booking status
    await db.query(
      `UPDATE orders SET status = 'Paid', razorpay_payment_id = ? WHERE razorpay_order_id = ?`,
      [razorpay_payment_id, razorpay_order_id]
    );

    await db.query(`UPDATE bookings SET status = 'Paid' WHERE id = ?`, [
      booking_id,
    ]);

    res.status(200).json({ success: true, message: "Payment confirmed" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error confirming payment" });
  } finally {
    db.release();
  }
};
