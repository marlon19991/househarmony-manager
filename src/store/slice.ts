import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TaskState {
  [personId: string]: {
    [taskId: string]: boolean;
  };
}

interface AppState {
  selectedPerson: string;
  taskStates: TaskState;
  // ...existing code...
}

const initialState: AppState = {
  selectedPerson: '',
  taskStates: {},
  // ...existing code...
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSelectedPerson: (state, action: PayloadAction<string>) => {
      state.selectedPerson = action.payload;
      // Initialize task states for new person if not exists
      if (!state.taskStates[action.payload]) {
        state.taskStates[action.payload] = {};
      }
    },
    toggleTask: (state, action: PayloadAction<string>) => {
      const personId = state.selectedPerson;
      if (!state.taskStates[personId]) {
        state.taskStates[personId] = {};
      }
      state.taskStates[personId][action.payload] = !state.taskStates[personId][action.payload];
    },
    resetTasks: (state, action: PayloadAction<string>) => {
      state.taskStates[action.payload] = {};
    },
    // ...existing code...
  },
});

export const { setSelectedPerson, toggleTask, resetTasks } = appSlice.actions;
export default appSlice.reducer;
