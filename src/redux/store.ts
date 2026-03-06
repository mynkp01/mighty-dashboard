// store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import loadingReducer from './slices/loadingSlice';
import userForCrmReducer from './slices/userForCrmSlice';
import userReducer from './slices/userSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
  blacklist: ['userForCrm'],
};

const rootReducer = combineReducers({
  user: userReducer,
  setIsLoading: loadingReducer,
  userForCrm: userForCrmReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
