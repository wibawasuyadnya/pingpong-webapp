import { combineReducers } from "redux";
import globalSlice from "./slices/globalSlice";
import videoSlice from "./slices/videoSlice";
import volumeSlice from "./slices/volumeSlice";
import orientationSlice from "./slices/orientationSlice";

const rootReducer = combineReducers({
  global: globalSlice,
  video: videoSlice,
  volume: volumeSlice,
  orientation: orientationSlice
});

export default rootReducer;
