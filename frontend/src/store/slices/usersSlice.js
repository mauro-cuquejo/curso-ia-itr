/**
 * Slice de Usuarios para Redux
 * 
 * @description Maneja el estado de usuarios, listados, búsqueda y operaciones CRUD.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  currentUser: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    status: 'all',
    sort: 'created_at',
    order: 'DESC',
  },
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUsers: (state, action) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    reset: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setUsers,
  setPagination,
  setFilters,
  setCurrentUser,
  reset,
} = usersSlice.actions;

export default usersSlice.reducer;
