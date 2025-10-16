import logger from "redux-logger";
import { thunk } from "redux-thunk";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { loginReducer } from "./reducers/auth/login";
import { registerReducer } from "./reducers/auth/register";
import { getNotesReducer } from "./reducers/notes/getNotes";
import { deleteNotesReducer } from "./reducers/notes/deleteNote";
import { createNoteReducer } from "./reducers/notes/createNote";
import { singleNoteReducer } from "./reducers/notes/singleNote";

const rootReducer = combineReducers({
  // auth reducer
  login: loginReducer,
  register: registerReducer,

  //    notes
  getNotes: getNotesReducer,
  deleteNote: deleteNotesReducer,
  createNote: createNoteReducer,
  singleNote:singleNoteReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: () => [thunk, logger],
});
