import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedPerson, toggleTask, resetTasks } from '../store/slice';
import { configureStore } from '@reduxjs/toolkit';
import appReducer from '../store/slice';

const TASK_LIST = [
  { id: '1', title: 'Clean Kitchen' },
  { id: '2', title: 'Clean Bathroom' },
  { id: '3', title: 'Vacuum Living Room' },
  { id: '4', title: 'Take Out Trash' }
];

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const GeneralCleaning = () => {
  const dispatch = useDispatch();
  const selectedPerson = useSelector((state: RootState) => state.app.selectedPerson);
  const taskStates = useSelector((state: RootState) => state.app.taskStates);

  const handlePersonChange = (newPerson: string) => {
    if (selectedPerson !== newPerson) {
      dispatch(setSelectedPerson(newPerson));
      dispatch(resetTasks(newPerson));
    }
  };

  const calculateProgress = () => {
    if (!selectedPerson || !taskStates[selectedPerson]) return 0;
    const tasks = taskStates[selectedPerson];
    const totalTasks = TASK_LIST.length;
    const completedTasks = Object.values(tasks).filter(Boolean).length;
    return (completedTasks / totalTasks) * 100;
  };

  const isTaskCompleted = (taskId: string) => {
    return selectedPerson && taskStates[selectedPerson] 
      ? taskStates[selectedPerson][taskId] || false 
      : false;
  };

  return (
    <div>
      {/* ...existing JSX code... */}
      <div className="tasks-container">
        {TASK_LIST.map((task) => (
          <div key={task.id} className="task-item">
            <input
              type="checkbox"
              checked={isTaskCompleted(task.id)}
              onChange={() => dispatch(toggleTask(task.id))}
            />
            <span>{task.title}</span>
          </div>
        ))}
      </div>
      <div className="progress-bar">
        <div 
          className="progress"
          style={{ width: `${calculateProgress()}%` }}
        ></div>
      </div>
      {/* ...existing JSX code... */}
    </div>
  );
};
