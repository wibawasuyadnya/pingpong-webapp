import { combineReducers } from "redux";
import globalSlice from "./slices/globalSlice";

const rootReducer = combineReducers({
  global: globalSlice,
});

export default rootReducer;
