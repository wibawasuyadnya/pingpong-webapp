// redux/slices/volumeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VolumeState {
    volume: number;     // current volume (0 to 1)
    isMuted: boolean;   // whether the user has toggled mute
    lastVolume: number; // last non-zero volume before muting
}

const initialState: VolumeState = {
    volume: 1,       // default full volume
    isMuted: false,
    lastVolume: 1,   // remember the last non-zero volume
};

export const volumeSlice = createSlice({
    name: "volume",
    initialState,
    reducers: {
        // When the user drags the slider
        setVolume: (state, action: PayloadAction<number>) => {
            const newVol = action.payload;
            state.volume = newVol;
            // If newVol > 0, store it in lastVolume
            if (newVol > 0) {
                state.lastVolume = newVol;
            }
            // If user sets volume to 0, we consider it "muted"
            state.isMuted = newVol === 0;
        },

        // Toggling the icon
        toggleMute: (state) => {
            if (state.isMuted) {
                // unmute => restore lastVolume
                state.isMuted = false;
                state.volume = state.lastVolume;
            } else {
                // mute => store current volume in lastVolume, set volume=0
                state.isMuted = true;
                state.lastVolume = state.volume; // remember what it was
                state.volume = 0;
            }
        },
    },
});

export const { setVolume, toggleMute } = volumeSlice.actions;
export default volumeSlice.reducer;
