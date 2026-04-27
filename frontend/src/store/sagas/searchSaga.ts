import { call, put, takeLatest, select, debounce } from 'redux-saga/effects';
import { searchApi } from '@/api';
import {
  searchRequest,
  reloadRequest,
  searchSuccess,
  searchFailure,
  loadMoreRequest,
  loadMoreSuccess,
  loadMoreFailure,
  suggestionsRequest,
  suggestionsSuccess,
} from '../slices/searchSlice';
import type { RootState } from '../index';
import type { SearchResponse } from '@/types';

function* handleSearch(action: ReturnType<typeof searchRequest>) {
  try {
    const result: SearchResponse = yield call(searchApi.search, action.payload);
    yield put(searchSuccess({ items: result.items, nextPageToken: result.nextPageToken, fromCache: result.fromCache }));
  } catch (e: any) {
    yield put(searchFailure(e.response?.data?.message || e.message || 'Search failed'));
  }
}

function* handleReload() {
  try {
    const state: RootState = yield select();
    const { query } = state.search;
    if (!query) return;
    const result: SearchResponse = yield call(searchApi.search, query, undefined, true);
    yield put(searchSuccess({ items: result.items, nextPageToken: result.nextPageToken, fromCache: false }));
  } catch (e: any) {
    yield put(searchFailure(e.response?.data?.message || e.message || 'Reload failed'));
  }
}

function* handleLoadMore() {
  try {
    const state: RootState = yield select();
    const { query, nextPageToken } = state.search;
    if (!nextPageToken) return;

    const result: SearchResponse = yield call(
      searchApi.search,
      query,
      nextPageToken,
    );
    yield put(loadMoreSuccess({ items: result.items, nextPageToken: result.nextPageToken }));
  } catch (e: any) {
    yield put(loadMoreFailure(e.response?.data?.message || e.message || 'Load more failed'));
  }
}

function* handleSuggestions(action: ReturnType<typeof suggestionsRequest>) {
  try {
    const suggestions: string[] = yield call(searchApi.suggestions, action.payload);
    yield put(suggestionsSuccess(suggestions));
  } catch {
    yield put(suggestionsSuccess([]));
  }
}

export function* watchSearch() {
  yield takeLatest(searchRequest.type, handleSearch);
  yield takeLatest(reloadRequest.type, handleReload);
  yield takeLatest(loadMoreRequest.type, handleLoadMore);
  yield debounce(300, suggestionsRequest.type, handleSuggestions);
}
