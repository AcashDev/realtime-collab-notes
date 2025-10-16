import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

router.route("/").get(protect, getNotes).post(protect, createNote);
router.route("/:id").get(protect, getNote).put(protect, updateNote).delete(protect, deleteNote);

export default router;
