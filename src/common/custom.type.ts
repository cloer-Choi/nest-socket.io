import { Socket } from 'socket.io';

export type MySocket = Socket & { nickname: string };
