import { NextFunction, Request, RequestHandler, Response } from "express";
import Note from "../models/note";
import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import { runOpenRouter } from "../util/openRouterClient";

export const getNotes: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notes = await Note.find({ userId: req.user.userId }).exec();
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

export const getNote: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const noteId = req.params.noteId;
  try {
    if (!isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid Note id");
    }
    const note = await Note.findById(noteId).exec();
    if (!note) {
      throw createHttpError(404, "Note not found");
    }

    if (note.userId === req.user.userId) {
      throw createHttpError(401, "You cannot access this note!");
    }
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const title = req.body.title;
  const text = req.body.text;
  try {
    if (!title) {
      throw createHttpError(400, "Note must have a title!");
    }

    const newNote = await Note.create({
      userId: req.user.userId,
      title,
      text,
    });

    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const noteId = req.params.noteId;
  const newTitle = req.body.title;
  const newText = req.body.text;

  try {
    if (!isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid note ID");
    }

    if (!newTitle?.trim().length) {
      throw createHttpError(400, "Note must have a title");
    }

    const note = await Note.findById(noteId).exec();

    if (!note) {
      throw createHttpError(404, "Note not found");
    }

    // ✅ Allow only owner to update
    if (note.userId === req.user.userId) {
      throw createHttpError(403, "You are not authorized to edit this note");
    }

    note.title = newTitle;
    note.text = newText;
    const updatedNote = await note.save();
    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

export const togglePin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const noteId = req.params.noteId;

  try {
    if (!isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid note ID");
    }

    const note = await Note.findById(noteId).exec();

    if (!note) {
      throw createHttpError(404, "Note not found");
    }
    console.log(note.userId, req.user.userId);

    if (note.userId === req.user.userId) {
      throw createHttpError(403, "You are not authorized to modify this note");
    }

    note.isPinned = !note.isPinned;
    const updatedNote = await note.save();

    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

export const deleteNote: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const noteId = req.params.noteId;
  try {
    if (!isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid Note id");
    }

    const note = await Note.findById(noteId).exec();

    if (!note) {
      throw createHttpError(404, "Note not found");
    }

    if (note.userId === req.user.userId) {
      throw createHttpError(401, "You cannot access this note!");
    }

    await note.deleteOne({ _id: noteId });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

//AI Summary
export const summarizeNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId } = req.body;
    if (!isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid Note id");
    }

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const summary = await runOpenRouter({
      systemPrompt:
        "You are a helpful assistant that summarizes user notes clearly and concisely.",
      userPrompt: `Summarize this note: ${note.text}`,
    });

    res.json({ summary });
  } catch (err: any) {
    next(err);
  }
};

export const suggestTasksController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId } = req.body;
    if (!isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid Note id");
    }
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Call AI to suggest tasks
    const tasks = await runOpenRouter({
      systemPrompt: `You are a helpful assistant. The user wrote the following note:
    "${note.text}"`,
      userPrompt: `Extract actionable tasks or to-dos from this note. 
    Return them as a valid parsable JSON array of objects, without extra commentary.
    Example:
    [{"title":"Buy groceries","description":"Milk, Bread, Eggs"},{"title":"Draft email to client","description":"Follow up on project status"},{"title":"Prepare project outline","description":"Include key milestones and deadlines"}]`,
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

export const rewriteNoteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId, style } = req.body;

    if (!isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid Note id");
    }

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (!style || !note.text) {
      return res.status(400).json({ error: "Style is required" });
    }

    // Map style -> system prompt flavor
    const stylePrompts: Record<string, string> = {
      casual: "Rewrite the following note in a casual, friendly tone.",
      formal: "Rewrite the following note in a clear and professional tone.",
      concise: "Rewrite the following note in a shorter, more concise form.",
    };

    const systemPrompt =
      stylePrompts[style] || "Rewrite the following note in a polished style.";

    const rewritten = await runOpenRouter({
      systemPrompt,
      userPrompt: note.text,
    });

    return res.json({ rewritten });
  } catch (err) {
    next(err);
  }
};

export const qaNoteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId, questions } = req.body;

    if (!isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid Note id");
    }

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (!note.text || !questions) {
      return res
        .status(400)
        .json({ error: "Note text and question are required." });
    }

    const answer = await runOpenRouter({
      systemPrompt:
        "You are an assistant that answers questions based strictly on the provided note content. Do not invent facts outside the note.",
      userPrompt: `Note Content:\n${note.text}\n\nQuestion: ${questions}\n\nAnswer clearly and concisely.Return Response in question-answer pair as a valid parsable JSON array of object, without extra commentary.
    Example:
    [{"question":"Question-1",answer:"Answer-1"},{"question":"Question-2",answer:"Answer-2"}]`,
    });

    return res.json({ answer });
  } catch (err) {
    next(err);
  }
};

export const generateQuestionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId } = req.body;

    if (!isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid Note id");
    }

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (!note.text) {
      return res.status(400).json({ error: "Note text is required." });
    }

    // 🔹 Decide number of questions based on text length
    const length = note.text.trim().split(/\s+/).length; // word count
    let numQuestions = 1;

    if (length > 50 && length <= 100) numQuestions = 2;
    else if (length > 100 && length <= 200) numQuestions = 3;
    else if (length > 200 && length <= 400) numQuestions = 4;
    else if (length > 400) numQuestions = 5;

    const questions = await runOpenRouter({
      systemPrompt:
        "You are a helpful assistant that generates quiz-style questions from text. Provide clear, contextual questions that help the user reflect and test knowledge.",
      userPrompt: `Generate ${numQuestions} useful questions from this note content:\n\n${note.text}:`,
    });

    if (!questions) {
      return res.status(500).json({ error: "Failed to generate questions." });
    }

    res.json({
      success: true,
      numQuestions,
      questions,
    });
  } catch (err) {
    next(err);
  }
};
