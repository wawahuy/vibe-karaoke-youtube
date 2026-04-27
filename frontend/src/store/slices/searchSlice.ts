import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { VideoItem } from '@/types';

const HISTORY_KEY = 'yt_search_history';
const loadHistory = (): string[] => {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
};

interface SearchState {
  query: string;
  items: VideoItem[];
  nextPageToken: string | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  suggestions: string[];
  suggestionsLoading: boolean;
  fromCache: boolean;
  searchHistory: string[];
}

const initialState: SearchState = {
  query: '',
  items: [],
  nextPageToken: null,
  loading: false,
  loadingMore: false,
  error: null,
  suggestions: [],
  suggestionsLoading: false,
  fromCache: false,
  searchHistory: loadHistory(),
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchRequest(state, action: PayloadAction<string>) {
      state.query = action.payload;
      state.loading = true;
      state.error = null;
      state.items = [];
      state.nextPageToken = null;
      state.fromCache = false;
    },
    reloadRequest(state) {
      state.loading = true;
      state.error = null;
      state.items = [];
      state.nextPageToken = null;
      state.fromCache = false;
    },
    searchSuccess(
      state,
      action: PayloadAction<{ items: VideoItem[]; nextPageToken: string | null; fromCache?: boolean }>,
    ) {
      state.items = action.payload.items;
      state.nextPageToken = action.payload.nextPageToken;
      state.loading = false;
      state.fromCache = action.payload.fromCache ?? false;
    },
    searchFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    loadMoreRequest(state) {
      state.loadingMore = true;
    },
    loadMoreSuccess(
      state,
      action: PayloadAction<{ items: VideoItem[]; nextPageToken: string | null }>,
    ) {
      state.items = [...state.items, ...action.payload.items];
      state.nextPageToken = action.payload.nextPageToken;
      state.loadingMore = false;
    },
    loadMoreFailure(state, action: PayloadAction<string>) {
      state.loadingMore = false;
      state.error = action.payload;
    },
    suggestionsRequest(state, _action: PayloadAction<string>) {
      state.suggestionsLoading = true;
    },
    suggestionsSuccess(state, action: PayloadAction<string[]>) {
      state.suggestions = action.payload;
      state.suggestionsLoading = false;
    },
    clearSuggestions(state) {
      state.suggestions = [];
    },
    addToHistory(state, action: PayloadAction<string>) {
      const q = action.payload.trim();
      if (!q) return;
      const h = state.searchHistory;
      const idx = h.indexOf(q);
      if (idx >= 0) h.splice(idx, 1);
      h.unshift(q);
      if (h.length > 30) h.length = 30;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
    },
  },
});

export const {
  searchRequest,
  reloadRequest,
  searchSuccess,
  searchFailure,
  loadMoreRequest,
  loadMoreSuccess,
  loadMoreFailure,
  suggestionsRequest,
  suggestionsSuccess,
  clearSuggestions,
  addToHistory,
} = searchSlice.actions;

export default searchSlice.reducer;
