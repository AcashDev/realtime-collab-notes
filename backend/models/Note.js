import mongoose from "mongoose";

const editHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  oldContent: String,
  newContent: String,
  oldTitle: String,
  newTitle: String,
  timestamp: { type: Date, default: Date.now },
});

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  editHistory: [editHistorySchema],
}, { timestamps: true , optimisticConcurrency: true});

export default mongoose.model("Note", noteSchema);
