import { combineReducers } from "redux";
import globalSlice from "./slices/globalSlice";
import videoSlice from "./slices/videoSlice";
import volumeSlice from "./slices/volumeSlice";

const rootReducer = combineReducers({
  global: globalSlice,
  video: videoSlice,
  volume: volumeSlice
});

export default rootReducer;
