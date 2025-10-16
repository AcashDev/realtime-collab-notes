import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authAxios from "../../../config/authAxios";

const initialState = {
  loading: false,
  data: [],       // list of notes
  error: "",
  status: null,
  message: "",
};

// Fetch all notes
export const getNotesAction = createAsyncThunk(
  "notes/getNotes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAxios.get("/api/notes");
      return res?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete a note
export const deleteNoteAction = createAsyncThunk(
  "notes/deleteNote",
  async (noteId, { rejectWithValue }) => {
    try {
      const res = await authAxios.delete(`/api/notes/${noteId}`);
      return { noteId, ...res?.data }; // return deleted noteId for state update
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const deleteNotesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    resetNotesState: (state) => {
      state.loading = false;
      state.data = [];
      state.error = "";
      state.status = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    // Get Notes
    builder
      .addCase(getNotesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNotesAction.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action?.payload?.data || [];
        state.status = action?.payload?.status;
        state.message = action?.payload?.message;
      })
      .addCase(getNotesAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.payload?.error || "Something went wrong";
        state.status = action?.payload?.status;
        state.message = action?.payload?.message;
      });

    // Delete Note
    builder
      .addCase(deleteNoteAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteNoteAction.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted note from state
        state.data = state.data.filter((note) => note.id !== action.payload.noteId);
        state.status = action?.payload?.status;
        state.message = action?.payload?.message;
      })
      .addCase(deleteNoteAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.payload?.error || "Failed to delete note";
        state.status = action?.payload?.status;
        state.message = action?.payload?.message;
      });
  },
});

export const { resetNotesState } = deleteNotesSlice.actions;
export const deleteNotesReducer = deleteNotesSlice.reducer;
