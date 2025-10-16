import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment-timezone";
import { ToastContainer, toast } from "react-toastify";
import { useSocket } from "../../hooks/useSocket";
import {
  TrashIcon,
  PlusIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { getNotesAction } from "../../redux/reducers/notes/getNotes";
import { createNote } from "../../redux/reducers/notes/createNote";
import { deleteNoteAction } from "../../redux/reducers/notes/deleteNote";
import Skeleton from "@mui/material/Skeleton";
import { debounce } from "../../helper/debounce";
import { getSingleNoteAction } from "../../redux/reducers/notes/singleNote";
import Modal from "@mui/material/Modal";

const Home = () => {
  const { loading, data: notesData } = useSelector((state) => state.getNotes);
  const { loading: singleNoteLoading } = useSelector(
    (state) => state.singleNote
  );
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const { socket, emitEvent } = useSocket();
  const dispatch = useDispatch();

  // Filter notes
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
  );

  // Select note
  const handleNoteClick = (note) => {
    dispatch(getSingleNoteAction(note._id)).then((res) => {
      setSelectedNote(res?.payload?.data);
      // setNotes((prev) => prev.map((n) => (n._id === note._id ? res.payload : n)));
    });
    // Join note room for real-time sync
    emitEvent && emitEvent("join_note", note._id);
  };

  // Delete note
  const handleDeleteNote = (noteId) => {
   try {
    setNotes((prev) => prev.filter((n) => n._id !== noteId));
    if (selectedNote?._id === noteId) setSelectedNote(null);
    dispatch(deleteNoteAction(noteId)).then((res) => {
      toast.success(res?.payload?.message);
    });
   } catch (error) {
  toast.error("Something went wrong");
   }
  };

  // Create new note
  const handleNewNote = () => {
    try {
      const defaultNote = {
        title: "Untitled",
        content: "Edit your note here",
        editHistory: [],
      };
      dispatch(createNote(defaultNote)).then((res) => {
        setSelectedNote(res.payload);
        emitEvent && emitEvent("join_note", res.payload._id);
        toast.success("New note Created");
        console.log("📝 New note created:", res.payload);
      });
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleContentChange = useCallback(
    (e) => {
      const updatedContent = e.target.value;
      setSelectedNote((prev) => ({ ...prev, content: updatedContent }));
      debouncedEmit(updatedContent);
    },
    [selectedNote?._id]
  );

  const debouncedEmit = useMemo(
    () =>
      debounce((content) => {
        if (!selectedNote?._id) return;
        emitEvent("update_note", {
          noteId: selectedNote._id,
          content,
          userId:JSON.parse(localStorage.getItem("user") || null)?._id
        });
        console.log("📝 Debounced socket emit for note", selectedNote._id);
      }, 500),
    [selectedNote?._id, emitEvent]
  );

  const handleTitleChange = useCallback(
    (e) => {
      const updatedTitle = e.target.value;
      setSelectedNote((prev) => ({ ...prev, title: updatedTitle }));
      debouncedEmitTitle(updatedTitle);
    },
    [selectedNote?._id]
  );

  const debouncedEmitTitle = useMemo(
    () =>
      debounce((title) => {
        if (!selectedNote?._id) return;
        emitEvent("update_note", {
          noteId: selectedNote._id,
          title,
        });
        console.log("📝 Debounced socket emit for note", selectedNote._id);
      }, 500),
    [selectedNote?._id, emitEvent]
  );

  // Load all notes initially
  useEffect(() => {
    dispatch(getNotesAction());
  }, [dispatch]);

  useEffect(() => {
    if (notesData) {
      const withHistory = notesData.map((n) => ({
        ...n,
        editHistory: n.editHistory || [],
      }));
      setNotes(withHistory);
    }
  }, [notesData]);

  // 🧠 Real-time socket listeners
  useEffect(() => {
    if (!socket) return;
    //  Note updated in DB
    socket.on("note_updated_from_db", ({ noteId, updatedFields }) => {
      console.log("🟣 Note updated in DB:", { noteId, updatedFields });
      setNotes((prev) =>
        prev.map((note) =>
          note._id === noteId ? { ...note, ...updatedFields } : note
        )
      );
      if (selectedNote?._id === noteId) {
        setSelectedNote((prev) => ({ ...prev, ...updatedFields }));
      }
    });

    //  Note deleted in DB
    socket.on("note_deleted_from_db", ({ noteId }) => {
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
      }
    });

    //  New note inserted
    socket.on("note_inserted_from_db", (newNote) => {
      setNotes((prev) => [...prev, newNote]);
    });

    return () => {
      socket.off("note_updated_from_db");
      socket.off("note_deleted_from_db");
      socket.off("note_inserted_from_db");
    };
  }, [socket, selectedNote?._id]);

  return (
    <>
      <div className="flex h-[calc(100vh-64px)] rounded-2xl shadow-2xl bg-gray-50">
        {/* Left Section */}
        <div className="w-1/3 border-gray-300 bg-gray-50 flex flex-col">
          <div className="p-4 flex flex-col gap-2">
            <button
              className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              onClick={handleNewNote}
            >
              <PlusIcon className="h-5 w-5" /> New Note
            </button>
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-black p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <Skeleton
                variant="rectangular"
                sx={{ height: "100px", width: "100%" }}
              />
            ) : filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className={`flex justify-between items-start p-4 cursor-pointer border-b hover:bg-gray-100 transition ${
                    selectedNote?._id === note._id ? "bg-purple-50" : ""
                  }`}
                >
                  <div
                    onClick={() => handleNoteClick(note)}
                    className="flex-1 pr-2 truncate"
                  >
                    <h3 className="font-semibold text-gray-800 truncate">
                      {note.title || "Untitled Note"}
                    </h3>
                    <p className="text-sm text-gray-500 w-full truncate ">
                      {note.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500 text-center">
                No notes found
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 bg-white flex flex-col">
          {selectedNote ? (
            <>
              <div className="p-4 border-b flex-col flex gap-4">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={handleTitleChange}
                  placeholder="Enter title..."
                  className="text-xl truncate w-full text-black font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 p-1"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Last updated:
                    {moment(selectedNote.updatedAt)
                      .tz("Asia/Kolkata")
                      .format("DD-MM-YYYY hh:mm A")}
                  </p>
                  <span
                    onClick={() => setShowHistory(true)}
                    className="hover:bg-gray-200  bg-gray-100 px-3 py-1 shadow-2xl w-fit rounded-2xl text-sm flex flex-row gap-1 text-gray-500 cursor-pointer"
                  >
                    Show History <ClockIcon className="h-5 w-5 text-gray-500" />
                  </span>
                </div>
              </div>

              <div className="flex-1 p-4">
                <textarea
                  value={selectedNote.content}
                  onChange={handleContentChange}
                  className="outline-none w-full text-black h-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Start typing..."
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400">
              Select a note to view or edit
            </div>
          )}
        </div>
      </div>
      <Modal
        className="w-1/2 h-full"
        open={showHistory}
        onClose={() => setShowHistory(false)}
      >
        <div className="w-full h-full flex flex-col bg-white">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg text-black font-semibold">Note History</h2>
            <button onClick={() => setShowHistory(false)}>
              <XMarkIcon className=" cursor-pointerh-10 w-10 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedNote?.editHistory?.length > 0 ? selectedNote.editHistory.map((history, index) => (
             <div key={history._id} className="bg-white shadow-md rounded-lg p-4 mb-3 border border-gray-200">
             <div className="flex justify-between items-center mb-2">
               <span className="text-sm text-gray-500">Last Update By:</span>
               <span className="text-sm font-semibold text-gray-800">
                 {history.userId?.name || "Unknown"}
               </span>
             </div>
             <div className="grid grid-cols-2 gap-4 mb-2">
               <div>
                 <p className="text-xs text-gray-400">Old Title</p>
                 <p className="text-sm text-gray-700 truncate">{history.oldTitle || "-"}</p>
               </div>
               <div>
                 <p className="text-xs text-gray-400">New Title</p>
                 <p className="text-sm text-gray-700 truncate">{history.newTitle || "-"}</p>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4 mb-2">
               <div>
                 <p className="text-xs text-gray-400">Old Content</p>
                 <p className="text-sm text-gray-700 truncate">{history.oldContent || "-"}</p>
               </div>
               <div>
                 <p className="text-xs text-gray-400">New Content</p>
                 <p className="text-sm text-gray-700 truncate">{history.newContent || "-"}</p>
               </div>
             </div>
             <div className="text-right text-xs text-gray-400">
               Last updated: {moment(history.timestamp).tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A")}
             </div>
           </div>
           )
            ) : (
              <div className="flex flex-1 items-center justify-center text-gray-400">
                No history found
              </div>
            )}
          </div>
        </div>
      </Modal>
      <ToastContainer/>
    </>
  );
};

export default Home;
