import {type Middleware } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { pollActions } from "./pollSlice";
import type{ ServerToClientEvents, ClientToServerEvents } from "../types/socket";

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export const createSocketMiddleware = (socket: SocketType): Middleware => {
  return (store) => (next) => {
    // Setup socket event listeners
    socket.on("poll_state", (data) => {
      store.dispatch(pollActions.setPollState(data));
    });

    socket.on("new_poll", (poll) => {
      store.dispatch(pollActions.setCurrentPoll(poll));
      store.dispatch(pollActions.setHasVoted(false));
    });

    socket.on("poll_update", (data) => {
      store.dispatch(pollActions.updateResults(data));
    });

    socket.on("poll_ended", (data) => {
      store.dispatch(pollActions.endPoll(data));
    });

    socket.on("vote_confirmed", (data) => {
      store.dispatch(pollActions.setHasVoted(true));
      store.dispatch(pollActions.setSelectedOption(data.optionIndex));
    });

    socket.on("user_count_update", (data) => {
      store.dispatch(pollActions.setUserCounts(data));
    });

    return (action) => next(action);
  };
};