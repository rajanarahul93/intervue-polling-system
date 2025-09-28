import { configureStore } from "@reduxjs/toolkit";
import {type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import pollReducer from "./pollSlice";

// Store configuration without middleware initially
export const store = configureStore({
  reducer: {
    poll: pollReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore socket instances in actions
        ignoredActionsPaths: ["payload.socket"],
        ignoredPaths: ["socket"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Socket middleware will be added after socket is initialized
export const addSocketMiddleware = (socketMiddleware: any) => {
  // This will be called from App component after socket is ready
};