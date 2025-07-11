import mongoose, { InferSchemaType, Schema, model } from "mongoose";

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  text?: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true },
    title: { type: String, required: true },
    text: { type: String },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

type Note = InferSchemaType<typeof noteSchema>;

export default model<Note>("Note", noteSchema);
