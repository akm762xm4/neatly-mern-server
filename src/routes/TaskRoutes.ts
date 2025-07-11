import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
} from "../controllers/TaskControllers";

const router = express.Router();

router.get("/", getTasks); // Get all tasks
router.post("/", createTask); // Create a task
router.patch("/:taskId", updateTask); // Update task
router.delete("/:taskId", deleteTask); // Delete task
router.patch("/:taskId/toggle", toggleComplete); // Toggle complete/incomplete

export default router;
