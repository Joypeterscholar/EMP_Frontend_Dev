'use client';
import { configureStore } from '@reduxjs/toolkit';
import selectedMeshReducer from './reducers/meshReducer';
import menuReducer from './reducers/menuReducer';
import userReducer, {
  getAccessTokenFromLocalStorage,
  getUserFromLocalStorage,
} from './reducers/userReducer';
import settingReducer from './reducers/settingReducer';

export const store = configureStore({
  reducer: {
    selectedMeshState: selectedMeshReducer,
    userState: userReducer,
    menuState: menuReducer,
    settingState: settingReducer,
  },
  preloadedState: {
    userState: {
      user: getUserFromLocalStorage(),
      accessToken: getAccessTokenFromLocalStorage(),
    },
  },
});
