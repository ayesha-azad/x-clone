"use client";

import { io } from "socket.io-client";

export const socket = io({
  autoConnect: true,
  reconnectionAttempts: 5,
  timeout: 10000,
});