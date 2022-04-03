import { configureStore } from "@reduxjs/toolkit";
import indexReducer, { indexSlice } from "@redux/slices/indexSlice";
import { createWrapper } from "next-redux-wrapper";

const makeStore = () =>
  configureStore({
    reducer: {
      [indexSlice.name]: indexReducer,
    },
    devTools: true,
  });

export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;

export const wrapper = createWrapper<AppStore>(makeStore);
