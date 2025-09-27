import express from "express";
import {
  createNote,
  deleteNote,
  generateQuestionsController,
  getNote,
  getNotes,
  qaNoteController,
  rewriteNoteController,
  suggestTasksController,
  summarizeNote,
  togglePin,
  updateNote,
} from "../controllers/NotesControllers";

const router = express.Router();

router.get("/", getNotes);

router.get("/:noteId", getNote);

router.post("/", createNote);

router.patch("/:noteId", updateNote);

router.patch("/:noteId/pin", togglePin);

router.delete("/:noteId", deleteNote);

router.post("/summarize", summarizeNote);

router.post("/suggest-tasks", suggestTasksController);

router.post("/rewrite", rewriteNoteController);

router.post("/qa", qaNoteController);

router.post("/qg", generateQuestionsController);

export default router;
