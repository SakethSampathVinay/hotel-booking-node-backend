import express from "express";
import authUser from "../middleware/authUser.js";
import { confirmPayment, createOrder } from "../controllers/ordersController.js";

const ordersRouter = express.Router();

ordersRouter.post('/create-order', authUser, createOrder);
ordersRouter.post("/confirm-booking", authUser, confirmPayment);

export default ordersRouter;