import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface GameState {
  stompClient: Client | null;
  connected: boolean;
  playerName: string;
  gameId: string | null;
  players: any[]; // Replace with proper type later
  setPlayerName: (name: string) => void;
  connect: (playerName: string) => void;
  disconnect: () => void;
  joinGame: (gameId: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  stompClient: null,
  connected: false,
  playerName: '',
  gameId: null,
  players: [],

  setPlayerName: (name) => set({ playerName: name }),

  connect: (playerName) => {
    const socket = new SockJS('http://localhost:8080/ws-game');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        set({ connected: true, stompClient: client, playerName });
        // Subscribe to global lobby or game-specific topics here
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();
  },

  disconnect: () => {
    const { stompClient } = get();
    if (stompClient) {
      stompClient.deactivate();
      set({ connected: false, stompClient: null });
    }
  },

  joinGame: (gameId) => {
    const { stompClient, playerName } = get();
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/app/game.join`,
        body: JSON.stringify({ gameId, playerName }),
      });
      set({ gameId });
    }
  },
}));
