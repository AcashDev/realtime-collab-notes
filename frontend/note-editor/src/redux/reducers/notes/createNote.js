import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authAxios from "../../../config/authAxios";

// Initial state
const initialState = {
  notes: [],
  selectedNote: null,
  loading: false,
  error: "",
};

// Thunks
export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAxios.get("/api/notes");
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createNote = createAsyncThunk(
  "notes/createNote",
  async (noteData, { rejectWithValue }) => {
    try {
      const res = await authAxios.post("/api/notes", noteData);
      return res.data.data; // newly created note
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createNoteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => { state.loading = true; })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch notes";
      })
      // Create note
      .addCase(createNote.pending, (state) => { state.loading = true; })
      .addCase(createNote.fulfilled, (state, action) => {
        state.loading = false;
        state.notes.unshift(action.payload); // add new note to top
        state.selectedNote = action.payload; // auto-select
      })
      .addCase(createNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create note";
      });
  },
});

export const { setSelectedNote, updateNoteLocally } = createNoteSlice.actions;
export const createNoteReducer = createNoteSlice.reducer;
