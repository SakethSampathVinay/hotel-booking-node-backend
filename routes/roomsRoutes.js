import express from "express";
import { addHotel, getHotels } from "../controllers/roomsController.js";
import upload from "../middleware/multer.js";
import authUser from "../middleware/authUser.js";

const roomsRouter = express.Router();

roomsRouter.post("/add-hotels", upload.array("images", 4), authUser, addHotel);
roomsRouter.get("/get-rooms", authUser, getHotels);

export default roomsRouter;
// hotels-listing
