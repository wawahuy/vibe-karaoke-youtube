import { call, put, takeLatest } from 'redux-saga/effects';
import { videoApi } from '@/api';
import {
  fetchVideoRequest,
  fetchVideoSuccess,
  fetchVideoFailure,
} from '../slices/videoSlice';
import type { VideoInfo } from '@/types';

function* handleFetchVideo(action: ReturnType<typeof fetchVideoRequest>) {
  try {
    const info: VideoInfo = yield call(videoApi.getInfo, action.payload);
    yield put(fetchVideoSuccess(info));
  } catch (e: any) {
    yield put(
      fetchVideoFailure(e.response?.data?.message || e.message || 'Failed to load video'),
    );
  }
}

export function* watchVideo() {
  yield takeLatest(fetchVideoRequest.type, handleFetchVideo);
}
