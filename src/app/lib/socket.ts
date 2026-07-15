'use client';

import { io } from 'socket.io-client';

const socketUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:10000';

export const socket = io(socketUrl, {
  autoConnect: true,
});
