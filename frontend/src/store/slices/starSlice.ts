import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'yt_starred';

const load = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const starSlice = createSlice({
  name: 'star',
  initialState: { ids: load() },
  reducers: {
    toggleStar(state, { payload }: PayloadAction<string>) {
      const i = state.ids.indexOf(payload);
      if (i >= 0) {
        state.ids.splice(i, 1);
      } else {
        state.ids.unshift(payload);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.ids));
    },
  },
});

export const { toggleStar } = starSlice.actions;
export default starSlice.reducer;
