import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import authAxios from "../../../config/authAxios"


const initialState = { status: null, loading: false, data: [], error: "", message: "", }


export const loginAction = createAsyncThunk(
    'login',
    async (data, { rejectWithValue }) => {
        try {
            const res = await authAxios.post(`/api/auth/login`, { ...data })
            return res?.data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


export const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        resetLoginStatus: (state) => {
          state.status = null;
          state.message = null;
        },
      },
    extraReducers:
        (builder) => {
            builder.addCase(loginAction.pending, (state) => {
                state.loading = true
            })
            builder.addCase(loginAction.fulfilled, (state, action) => {
                state.loading = false
                state.data = action?.payload?.data
                state.status = action?.payload?.status
                state.message = action?.payload?.message
            })
            builder.addCase(loginAction.rejected, (state, action) => {
                state.loading = false
                state.error = action?.payload?.error
                state.status = action?.payload?.status
                state.message = action?.payload?.message
            })
        },

})


export const { resetLoginStatus } = loginSlice.actions;
export const loginReducer = loginSlice.reducer