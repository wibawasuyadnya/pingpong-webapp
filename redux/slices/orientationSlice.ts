import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrientationSlice {
    orientationMap: Record<string, boolean | null>;
}

const initialState: OrientationSlice = {
    orientationMap: {},
};

export const orientationSlice = createSlice({
    name: "orientation",
    initialState,
    reducers: {
        setVideoOrientation: (
            state,
            action: PayloadAction<{ videoId: string; isLandscape: boolean | null }>
        ) => {
            const { videoId, isLandscape } = action.payload;
            state.orientationMap[videoId] = isLandscape;
        },
    },
});

export const { setVideoOrientation } = orientationSlice.actions;
export default orientationSlice.reducer;
