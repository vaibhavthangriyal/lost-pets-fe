import { io } from 'socket.io-client';
import { AppNotification } from './api';

export function connectNotificationSocket(token: string, onNotification: (notification: AppNotification) => void) {
  const origin = (process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
  const socket = io(`${origin}/notifications`, { auth: { token }, transports: ['websocket', 'polling'], reconnection: true });
  socket.on('notification:new', onNotification);
  return () => { socket.disconnect(); };
}
