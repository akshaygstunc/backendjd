import express from "express";
import upload from "../middleware/multer.js";
import { getMediaByField, getMediaById, uploadMultipleMedia } from "./uploadController.js";
import multer from "multer";
import path from "path";
import authenticateToken from "../middleware/authentication.js";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const uploadAny = multer({ storage }).any();

const router = express.Router();  

router.post("/media", authenticateToken, uploadAny, uploadMultipleMedia);
router.get("/media/:id", getMediaById);
router.get("/media/field/:field", getMediaByField);

export default router;