import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import searchReducer from './slices/searchSlice';
import videoReducer from './slices/videoSlice';
import starReducer from './slices/starSlice';
import { rootSaga } from './sagas';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    search: searchReducer,
    video: videoReducer,
    star: starReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
