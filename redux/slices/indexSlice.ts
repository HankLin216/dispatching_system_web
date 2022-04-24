import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import { Project, Task } from "@modules/mysql";
import type { Overwrite } from "lib/typeHelper";

interface State {
  AddProjectDialogStatus: boolean;
  ProjectList: Overwrite<Project, { CreateDate: string; UpdateDate: string }>[];
  SelectedTaskList: Overwrite<Task, { CreateDate: string; UpdateDate: string }>[];
}

const initialState: State = {
  AddProjectDialogStatus: false,
  ProjectList: [],
  SelectedTaskList: [],
};

export const indexSlice = createSlice({
  name: "index",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // client
    CHANGE_ADDDIALOG_STATUS: (state) => {
      return {
        ...state,
        AddProjectDialogStatus: !state.AddProjectDialogStatus,
      };
    },
    UPDATE_PJLIST: (
      state,
      action: PayloadAction<Overwrite<Project, { CreateDate: string; UpdateDate: string }>[]>,
    ) => {
      return {
        ...state,
        ProjectList: [...action.payload],
      };
    },
    UPDATE_SELECTED_TKLIST: (
      state,
      action: PayloadAction<Overwrite<Task, { CreateDate: string; UpdateDate: string }>[]>,
    ) => {
      return {
        ...state,
        SelectedTaskList: [...action.payload],
      };
    },
    // server
    SERVER_INIT_PROJECTLIST: (
      state,
      action: PayloadAction<Overwrite<Project, { CreateDate: string; UpdateDate: string }>[]>,
    ) => {
      return {
        ...state,
        ProjectList: [...action.payload],
      };
    },
    SERVER_INIT_TASKLIST: (
      state,
      action: PayloadAction<Overwrite<Task, { CreateDate: string; UpdateDate: string }>[]>,
    ) => {
      return {
        ...state,
        SelectedTaskList: [...action.payload],
      };
    },
  },
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.index,
      };
    },
  },
});
export const Actions = indexSlice.actions;
export default indexSlice.reducer;
