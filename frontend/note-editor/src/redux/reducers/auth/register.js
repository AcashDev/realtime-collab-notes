import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import authAxios from "../../../config/authAxios"



const initialState = { status: null, loading: false, data: [], error: "", message: "", token: '' }


export const registerAction = createAsyncThunk(
    'register',
    async (data, { rejectWithValue }) => {
        try {
            const res = await authAxios.post(`/api/auth/register`, { ...data })
            return res?.data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


export const registerSlice = createSlice({
    name: 'register',
    initialState,
    reducers: {
        resetRegisterStatus: (state) => {
            state.status = null;
            state.message = null;
        }
    },
    extraReducers:
        (builder) => {
            builder.addCase(registerAction.pending, (state) => {
                state.loading = true
            })
            builder.addCase(registerAction.fulfilled, (state, action) => {
                state.loading = false
                state.data = action?.payload?.data
                state.status = action?.payload?.status
                state.message = action?.payload?.message
                state.token = action?.payload?.token
            })
            builder.addCase(registerAction.rejected, (state, action) => {
                state.loading = false
                state.error = action?.payload?.error
                state.status = action?.payload?.status
                state.message = action?.payload?.message
            })
        },

})

export const { resetRegisterStatus } = registerSlice.actions;
export const registerReducer = registerSlice.reducer