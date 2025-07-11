// models/TaskModel.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    isCompleted: { type: Boolean, default: false },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }
);

const TaskModel = mongoose.model<ITask>("Task", taskSchema);
export default TaskModel;
