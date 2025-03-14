import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import SystemReducer from "./reducers/SystemReducer";
import ProcessManagerReducer from "./reducers/ProcessManagerReducer";
import FileSystemReducer from "./reducers/FileSystemReducer";
import ClipboardReducer from "./reducers/ClipboardReducer";

export const store = configureStore({
  reducer: {
    system: SystemReducer,
    processManager: ProcessManagerReducer,
    fileSystem: FileSystemReducer,
    clipboard: ClipboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
