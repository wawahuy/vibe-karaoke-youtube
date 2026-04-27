import { all } from 'redux-saga/effects';
import { watchSearch } from './searchSaga';
import { watchVideo } from './videoSaga';

export function* rootSaga() {
  yield all([watchSearch(), watchVideo()]);
}
