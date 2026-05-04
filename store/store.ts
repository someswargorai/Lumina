import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import blogReducer from "./slices/blogSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        blog: blogReducer,
        notification: notificationReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type dispatch = typeof store.dispatch; 

