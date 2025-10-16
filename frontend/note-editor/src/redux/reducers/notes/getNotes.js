import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authAxios from "../../../config/authAxios";

// Initial state
const initialState = {
  loading: false,
  data: [],       // list of notes
  error: "",
  status: null,
  message: "",
};

// Async thunk to fetch all notes
export const getNotesAction = createAsyncThunk(
  "notes/getNotes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAxios.get("/api/notes"); // adjust endpoint
      return res?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const getNotesSlice = createSlice({
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
  },
});

// Exports
export const { resetNotesState } = getNotesSlice.actions;
export const getNotesReducer = getNotesSlice.reducer;
