import express from "express";
import {
  createFeedback,
  getFeedbacks,
} from "../controllers/feedbackController.js";
import authUser from "../middleware/authUser.js";

const feedbackRouter = express.Router();

feedbackRouter.post("/add-feedback", authUser, createFeedback);
feedbackRouter.get("/get-feedback/:room_id", authUser, getFeedbacks);

export default feedbackRouter;
