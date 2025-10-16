import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import "./config/db.js";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/note.js";
import Note from "./models/Note.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: "*" }));

// 🔹 Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});

app.set("io", io);

// 🔸 Add io to every req
app.use((req, res, next) => {
  req.io = app.get("io");
  next();
});

// 🧠 Socket.IO connection
io.on("connection", (socket) => {
  const token = socket.handshake.query.token;
  if (!token) {
    socket.emit("connect_error", { message: "Authentication error: No token provided" });
    socket.disconnect();
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log("JWT verification failed:", err);
    socket.emit("connection_error", { message: "Authentication error: Invalid token" });
    socket.disconnect();
    return;
  }
  console.log(`✅ Socket connected: ${socket.id}`);

  socket.on("join_note", (noteId) => {
    socket.join(noteId);
    console.log(`📌 Socket ${socket.id} joined note room ${noteId}`);
  });

  socket.on('update_note', async ({noteId,content,title,userId}) => {
    try {
      console.log('📝 Updating note via socket:', { userId});
      const note = await Note.findById(noteId).lean().exec();
      const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        {
          $set: { content, title },
          $push: {
            editHistory: { $each: [{userId,
              oldContent: note.content,
              newContent: content ?? note.content,
              oldTitle: note.title,
              newTitle: title ?? note.title,
              timestamp: new Date(),}],
              $slice:-10
              
            },
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedNote) {
        console.error(`Note with ID ${_id} not found.`);
        return;
      }

      // Broadcast updated note to all clients except sender
      socket.broadcast.emit('noteUpdated', updatedNote);

    } catch (error) {
      console.error('Error updating note via socket:', error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// 📝 Log middleware
app.use("/", (req, res, next) => {
  console.log(
    `${new Date().toISOString()}_${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
  );
  next();
});

// 🧭 Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 🚀 Start Server
server.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
);

// 🧠 MongoDB Change Stream — concurrency + realtime sync
const changeStream = Note.watch();

changeStream.on("change", (change) => {
  const { operationType, documentKey, updateDescription, fullDocument } = change;
  const noteId = documentKey._id.toString();

  if (operationType === "update") {
    // const updatedFields = updateDescription.updatedFields;
    Note.findById(noteId)
      .populate({
        path: "editHistory.userId",
        select: "name email",
      })
      .then((updatedFields) => {
        if (!updatedFields) return;
        console.log("📝 Populating updated note:", { noteId, updatedFields });
        io.to(noteId).emit("note_updated_from_db", { noteId, updatedFields }); 
      })
      .catch((err) => console.error(" Error populating updated note:", err));
  }
  

  if (operationType === "delete") {
    io.emit("note_deleted_from_db", { noteId });
  }

  if (operationType === "insert") {
    io.emit("note_inserted_from_db", fullDocument);
  }
});
