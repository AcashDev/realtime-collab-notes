import React, { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

const NoteEditor = ({ noteId, user }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    socket = io("http://localhost:5000"); // your backend URL
    socket.emit("join_note", noteId);

    socket.on("note_updated", (note) => {
      setContent(note.content);
    });

    socket.on("note_updated_from_db", (update) => {
      if (update.content) setContent(update.content);
    });

    return () => {
      socket.disconnect();
    };
  }, [noteId]);

  const handleChange = (e) => {
    setContent(e.target.value);
    socket.emit("update_note", { noteId, content: e.target.value, userId: user._id });
  };

  return (
    <textarea
      value={content}
      onChange={handleChange}
      className="w-full h-96 p-4 border rounded focus:outline-none"
    />
  );
};

export default NoteEditor;
