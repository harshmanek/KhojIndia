import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
const store = configureStore({
  reducer: {
    // authReducer
    auth: authReducer,
  },
});
export default store;
