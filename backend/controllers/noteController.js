import Note from "../models/Note.js";

export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.create({ title, content, owner: req.user._id });
    res.status(201).json({
      data: note,
      status: true,
      message: "Note created successfully",
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Something went wrong" });
  }
};

export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({
      updatedAt: -1,
    }).populate({
      path: "editHistory.userId",   // 👈 populate nested user
      select: "name email",         // 👈 select only needed fields
    }).lean().exec();
    res.status(200).json({
      data: notes,
      status: true,
      message: "Notes fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Something went wrong" });
  }
};

export const getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate({
      path: "editHistory.userId",   // 👈 populate nested user
      select: "name email",         // 👈 select only needed fields
    }).lean().exec();
    if (!note)
      return res.status(404).json({ status: false, message: "Note not found" });
    res.status(200).json({
      data: note,
      status: true,
      message: "Notes fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Something went wrong" });
  }
};

export const updateNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: "Note not found" });

  note.title = req.body.title || note.title;
  note.content = req.body.content || note.content;

  note.editHistory.push({ userId: req.user._id, content: note.content });
  if (note.editHistory.length > 10) note.editHistory.shift();

  const updatedNote = await note.save();
  res.json(updatedNote);
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note)
      return res.status(404).json({ status: false, message: "Note not found" });
    await note.deleteOne();
    res.status(200).json({ status: true, message: "Note deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Something went wrong" });
  }
};
