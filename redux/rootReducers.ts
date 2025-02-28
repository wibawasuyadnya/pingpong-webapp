import { combineReducers } from "redux";
import globalSlice from "./slices/globalSlice";
import videoSlice from "./slices/videoSlice";

const rootReducer = combineReducers({
  global: globalSlice,
  video: videoSlice,
});

export default rootReducer;
