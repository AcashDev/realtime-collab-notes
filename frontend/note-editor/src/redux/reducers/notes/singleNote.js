import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authAxios from "../../../config/authAxios";

const initialState = {
  loading: false,
  note: null,     // single note object
  error: "",
  status: null,
  message: "",
};

// 📝 Fetch single note by ID
export const getSingleNoteAction = createAsyncThunk(
  "notes/getSingleNote",
  async (noteId, { rejectWithValue }) => {
    try {
      const res = await authAxios.get(`/api/notes/${noteId}`);
      return res?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: "Failed to fetch note" });
    }
  }
);

const singleNoteSlice = createSlice({
  name: "singleNote",
  initialState,
  reducers: {
    resetSingleNoteState: (state) => {
      state.loading = false;
      state.note = null;
      state.error = "";
      state.status = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Get single note
      .addCase(getSingleNoteAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSingleNoteAction.fulfilled, (state, action) => {
        state.loading = false;
        state.note = action?.payload?.data || null;
        state.status = action?.payload?.status;
        state.message = action?.payload?.message;
      })
      .addCase(getSingleNoteAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.payload?.error || "Something went wrong";
        state.status = action?.payload?.status;
        state.message = action?.payload?.message;
      });
  },
});

export const { resetSingleNoteState } = singleNoteSlice.actions;
export const singleNoteReducer = singleNoteSlice.reducer;
