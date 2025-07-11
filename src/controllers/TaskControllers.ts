import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import TaskModel from "../models/Task";

// ✅ Get all tasks for the logged-in user
export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tasks = await TaskModel.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// ✅ Create a new task
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description, dueDate, priority } = req.body;

  try {
    if (!title) throw createHttpError(400, "Task must have a title");

    const task = await TaskModel.create({
      userId: req.user._id,
      title,
      description: description,
      dueDate,
      priority,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// ✅ Update a task
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description, dueDate, priority, isCompleted } = req.body;
  const taskId = req.params.taskId;

  try {
    if (!mongoose.isValidObjectId(taskId)) {
      throw createHttpError(400, "Invalid task ID");
    }

    const task = await TaskModel.findById(taskId).exec();
    if (!task) throw createHttpError(404, "Task not found");

    if (task.userId.toString() !== req.user._id.toString()) {
      throw createHttpError(403, "Unauthorized to modify this task");
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.dueDate = dueDate ?? task.dueDate;
    task.priority = priority ?? task.priority;
    task.isCompleted = isCompleted ?? task.isCompleted;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// ✅ Delete a task
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const taskId = req.params.taskId;

  try {
    if (!mongoose.isValidObjectId(taskId)) {
      throw createHttpError(400, "Invalid task ID");
    }

    const task = await TaskModel.findById(taskId).exec();
    if (!task) throw createHttpError(404, "Task not found");

    if (task.userId.toString() !== req.user._id.toString()) {
      throw createHttpError(403, "Unauthorized to delete this task");
    }

    await task.deleteOne();
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

// ✅ Toggle completed/incomplete
export const toggleComplete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const taskId = req.params.taskId;

  try {
    if (!mongoose.isValidObjectId(taskId)) {
      throw createHttpError(400, "Invalid task ID");
    }

    const task = await TaskModel.findById(taskId).exec();
    if (!task) throw createHttpError(404, "Task not found");

    if (task.userId.toString() !== req.user._id.toString()) {
      throw createHttpError(403, "Unauthorized to update this task");
    }

    task.isCompleted = !task.isCompleted;
    const updated = await task.save();

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
