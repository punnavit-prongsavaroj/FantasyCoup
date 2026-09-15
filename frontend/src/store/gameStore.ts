import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface GameState {
  stompClient: Client | null;
  connected: boolean;
  playerName: string;
  gameId: string | null;
  players: string[];
  gameStatus: string;
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
  gameStatus: 'WAITING',

  setPlayerName: (name) => set({ playerName: name }),

  connect: (playerName) => {
    // If already connected, do nothing
    if (get().connected) return;

    // Replace with your actual backend URL when deploying
    const socket = new SockJS('http://localhost:8080/ws-game');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        set({ connected: true, stompClient: client, playerName });
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
      set({ connected: false, stompClient: null, gameId: null, players: [] });
    }
  },

  joinGame: (gameId) => {
    const { stompClient, playerName } = get();
    if (stompClient && stompClient.connected) {
      
      // Subscribe to the game room
      stompClient.subscribe(`/topic/game/${gameId}`, (message) => {
        const data = JSON.parse(message.body);
        console.log('Received Game State:', data);
        set({ 
          players: data.players,
          gameStatus: data.status 
        });
      });

      // Send join request
      stompClient.publish({
        destination: `/app/game.join`,
        body: JSON.stringify({ gameId, playerName }),
      });
      
      set({ gameId });
    }
  },
}));
