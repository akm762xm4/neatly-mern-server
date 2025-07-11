// controllers/overviewController.ts
import { Request, Response } from "express";
import Task from "../models/Task";
import Note from "../models/note";
import User from "../models/user";

export const getOverview = async (req: Request, res: Response) => {
  const userId = req.user._id;

  const [tasks, notes, user] = await Promise.all([
    Task.find({ userId }),
    Note.find({ userId }),
    User.findById(userId).select("username email createdAt"),
  ]);

  // 📋 Task Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const latestTask = tasks.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )[0];

  // 📅 Due Dates for Calendar
  const dueDates = tasks
    .filter((t) => t.dueDate)
    .map((t) => t.dueDate!.toISOString());

  // 📊 Chart Data: Completed tasks grouped by date (last 7 days)
  const chartMap = new Map<string, number>();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Include today

  tasks.forEach((task) => {
    if (task.isCompleted && task.updatedAt >= sevenDaysAgo) {
      const day = task.updatedAt.toISOString().slice(0, 10); // "YYYY-MM-DD"
      chartMap.set(day, (chartMap.get(day) || 0) + 1);
    }
  });

  const chart = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      date: key,
      completed: chartMap.get(key) || 0,
    };
  });

  // 📝 Note Stats
  const totalNotes = notes.length;
  const latestNote = notes.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )[0];

  // 🧾 Recent Timeline (combined and typed)
  const recentTimeline = [...tasks, ...notes]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 10)
    .map((item) => {
      if ("isCompleted" in item) {
        // It's a Task
        if (item.isCompleted) {
          return {
            type: "task_completed",
            title: item.title,
            date: item.updatedAt.toISOString(),
          };
        } else if (item.dueDate && new Date(item.dueDate) > new Date()) {
          return {
            type: "task_due",
            title: item.title,
            date: item.dueDate.toISOString(),
          };
        } else {
          return {
            type: "task_edited",
            title: item.title,
            date: item.updatedAt.toISOString(),
          };
        }
      } else {
        // It's a Note
        return {
          type: "note_edited", // or note_added based on created/updated diff
          title: item.title,
          date: item.updatedAt.toISOString(),
        };
      }
    });

  res.json({
    user: {
      username: user?.username,
      email: user?.email,
      joined: user?.createdAt,
    },
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      latest: latestTask,
      dueDates,
    },
    notes: {
      total: totalNotes,
      latest: latestNote,
    },
    chart,
    recentTimeline,
  });
};
