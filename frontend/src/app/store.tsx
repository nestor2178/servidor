//store.tsx
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/ApiSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";

interface AuthState {
    token: string;
}

export interface RootState {
    [apiSlice.reducerPath]: ReturnType<typeof apiSlice.reducer>;
    auth: AuthState;
}

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: false,
});

setupListeners(store.dispatch);
