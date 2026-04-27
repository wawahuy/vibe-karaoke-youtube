import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { VideoInfo } from '@/types';

interface VideoState {
  currentVideo: VideoInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: VideoState = {
  currentVideo: null,
  loading: false,
  error: null,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    fetchVideoRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    fetchVideoSuccess(state, action: PayloadAction<VideoInfo>) {
      state.currentVideo = action.payload;
      state.loading = false;
    },
    fetchVideoFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearVideo(state) {
      state.currentVideo = null;
      state.error = null;
    },
  },
});

export const {
  fetchVideoRequest,
  fetchVideoSuccess,
  fetchVideoFailure,
  clearVideo,
} = videoSlice.actions;

export default videoSlice.reducer;
