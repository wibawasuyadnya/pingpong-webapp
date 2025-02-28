import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VideoState {
    base64Data: string | null;
    size: number | null;
    type: string | null;
}

const initialState: VideoState = { base64Data: null, size: null, type: null };

export const videoSlice = createSlice({
    name: "video",
    initialState,
    reducers: {
        setVideo: (state, action: PayloadAction<Partial<VideoState>>) => {
            // Update whichever fields are passed
            if (action.payload.base64Data !== undefined) {
                state.base64Data = action.payload.base64Data;
            }
            if (action.payload.size !== undefined) {
                state.size = action.payload.size;
            }
            if (action.payload.type !== undefined) {
                state.type = action.payload.type;
            }
        },
        clearVideo: (state) => {
            state.base64Data = null;
            state.size = null;
            state.type = null;
        },
    },
});


export const { setVideo, clearVideo } = videoSlice.actions;
export default videoSlice.reducer;
