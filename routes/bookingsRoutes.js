import express from "express";
import {
  bookHotel,
  calculateBooking,
  cancelBooking,
  getBookings,
} from "../controllers/bookingsController.js";
import authUser from "../middleware/authUser.js";

const bookingRouter = express.Router();

bookingRouter.post("/book-room", authUser, bookHotel);
bookingRouter.get("/get-bookings", authUser, getBookings);
bookingRouter.delete("/cancel-booking/:booking_id", authUser, cancelBooking);
bookingRouter.post("/calculate-booking", authUser, calculateBooking);

export default bookingRouter;