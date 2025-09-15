import express from "express";
import {
  deleteProfile,
  getProfile,
  updateProfile,
} from "../controllers/profileController.js";
import authUser from "../middleware/authUser.js";

const profileRouter = express.Router();

profileRouter.get("/get-profile/:user_id", authUser, getProfile);
profileRouter.post("/update-profile/:user_id", authUser, updateProfile);
profileRouter.delete("/delete-profile/:user_id", authUser, deleteProfile);

export default profileRouter;
