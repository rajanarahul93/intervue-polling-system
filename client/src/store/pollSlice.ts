import { createSlice,type PayloadAction } from "@reduxjs/toolkit";
import type { Poll, PollResult } from "../types/socket";

interface PollState {
  currentPoll: Poll | null;
  results: PollResult[] | null;
  hasVoted: boolean;
  selectedOption: number | null;
  totalVotes: number;
  userCounts: {
    teachers: number;
    students: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: PollState = {
  currentPoll: null,
  results: null,
  hasVoted: false,
  selectedOption: null,
  totalVotes: 0,
  userCounts: {
    teachers: 0,
    students: 0,
  },
  loading: false,
  error: null,
};

const pollSlice = createSlice({
  name: "poll",
  initialState,
  reducers: {
    setPollState: (
      state,
      action: PayloadAction<{
        poll: Poll | null;
        hasVoted: boolean;
        results: PollResult[] | null;
      }>
    ) => {
      const { poll, hasVoted, results } = action.payload;
      state.currentPoll = poll;
      state.hasVoted = hasVoted;
      state.results = results;
    },
    setCurrentPoll: (state, action: PayloadAction<Poll>) => {
      state.currentPoll = action.payload;
      state.results = null;
      state.hasVoted = false;
      state.selectedOption = null;
      state.error = null;
    },
    updateResults: (
      state,
      action: PayloadAction<{ totalVotes: number; results: PollResult[] }>
    ) => {
      state.totalVotes = action.payload.totalVotes;
      state.results = action.payload.results;
    },
    endPoll: (
      state,
      action: PayloadAction<{
        poll: Poll;
        results: PollResult[];
        totalVotes: number;
      }>
    ) => {
      if (state.currentPoll) {
        state.currentPoll.isActive = false;
      }
      state.results = action.payload.results;
      state.totalVotes = action.payload.totalVotes;
    },
    setHasVoted: (state, action: PayloadAction<boolean>) => {
      state.hasVoted = action.payload;
    },
    setSelectedOption: (state, action: PayloadAction<number>) => {
      state.selectedOption = action.payload;
    },
    setUserCounts: (
      state,
      action: PayloadAction<{ teachers: number; students: number }>
    ) => {
      state.userCounts = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const pollActions = pollSlice.actions;
export default pollSlice.reducer;