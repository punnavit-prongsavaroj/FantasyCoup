import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface PlayerPublicState {
  name: string;
  coins: number;
  cardCount: number;
  alive: boolean;
}

export interface Card {
  id: string;
  role: string;
  revealed: boolean;
}

interface GameState {
  stompClient: Client | null;
  connected: boolean;
  playerName: string;
  gameId: string | null;
  players: string[];
  playersState: PlayerPublicState[];
  gameStatus: string;
  currentTurnPlayer: string | null;
  winnerName: string | null;
  pendingAction: any | null;
  myHand: Card[];
  
  setPlayerName: (name: string) => void;
  connect: (playerName: string, autoJoinGameId?: string) => void;
  disconnect: () => void;
  joinGame: (gameId: string) => void;
  startGame: () => void;
  takeAction: (actionType: string, targetPlayerName?: string) => void;
  reactToAction: (reactionType: string, roleClaimed?: string) => void;
  loseCard: (cardId: string) => void;
  leaveGame: () => void;
  fetchMyHand: () => Promise<void>;
  restoreConnection: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      stompClient: null,
      connected: false,
      playerName: '',
      gameId: null,
      players: [],
      playersState: [],
      gameStatus: 'WAITING',
      currentTurnPlayer: null,
      winnerName: null,
      pendingAction: null,
      myHand: [],

      setPlayerName: (name) => set({ playerName: name }),

      connect: (playerName, autoJoinGameId) => {
        if (get().connected) return;

        const socket = new SockJS('http://localhost:8080/ws-game');
        const client = new Client({
          webSocketFactory: () => socket,
          debug: (str) => console.log(str),
          onConnect: () => {
            set({ connected: true, stompClient: client, playerName });
            if (autoJoinGameId) {
              get().joinGame(autoJoinGameId);
            }
          },
          onStompError: (frame) => {
            console.error('Broker error: ' + frame.headers['message']);
          },
        });

        client.activate();
      },

      disconnect: () => {
        const { stompClient } = get();
        if (stompClient) {
          stompClient.deactivate();
        }
        set({ connected: false, stompClient: null, gameId: null, players: [], playersState: [], myHand: [], winnerName: null, pendingAction: null });
      },

      joinGame: (gameId) => {
        const { stompClient, playerName } = get();
        if (stompClient && stompClient.connected) {
          
          stompClient.subscribe(`/topic/game/${gameId}`, (message) => {
            const data = JSON.parse(message.body);
            set({ 
              players: data.players || [],
              playersState: data.playersState || [],
              gameStatus: data.status,
              currentTurnPlayer: data.currentTurnPlayer,
              winnerName: data.winnerName,
              pendingAction: data.pendingAction
            });
            
            const state = get();
            if (data.status === 'IN_PROGRESS' && state.myHand.length === 0) {
              state.fetchMyHand();
            }
          });

          stompClient.publish({
            destination: `/app/game.join`,
            body: JSON.stringify({ gameId, playerName }),
          });
          
          set({ gameId });
        }
      },

      startGame: () => {
        const { stompClient, gameId, playerName } = get();
        if (stompClient && stompClient.connected && gameId) {
          stompClient.publish({
            destination: `/app/game.start`,
            body: JSON.stringify({ gameId, playerName }),
          });
        }
      },

      takeAction: (actionType: string, targetPlayerName?: string) => {
        const { stompClient, gameId, playerName } = get();
        if (stompClient && stompClient.connected && gameId) {
          stompClient.publish({
            destination: `/app/game.action`,
            body: JSON.stringify({ gameId, playerName, actionType, targetPlayerName }),
          });
        }
      },

      reactToAction: (reactionType: string, roleClaimed?: string) => {
        const { stompClient, gameId, playerName } = get();
        if (stompClient && stompClient.connected && gameId) {
          stompClient.publish({
            destination: `/app/game.react`,
            body: JSON.stringify({ gameId, playerName, reactionType, roleClaimed }),
          });
        }
      },

      loseCard: (cardId: string) => {
        const { stompClient, gameId, playerName } = get();
        if (stompClient && stompClient.connected && gameId) {
          stompClient.publish({
            destination: `/app/game.loseCard`,
            body: JSON.stringify({ gameId, playerName, cardId }),
          });
        }
      },

      leaveGame: () => {
        set({ gameId: null, players: [], playersState: [], myHand: [], winnerName: null, pendingAction: null, gameStatus: 'WAITING' });
      },

      fetchMyHand: async () => {
        const { gameId, playerName } = get();
        if (!gameId || !playerName) return;

        try {
          const response = await fetch(`http://localhost:8080/api/game/${gameId}/player/${playerName}/hand`);
          if (response.ok) {
            const data = await response.json();
            set({ myHand: data });
          }
        } catch (error) {
          console.error('Failed to fetch hand:', error);
        }
      },

      restoreConnection: () => {
        const { playerName, gameId, connected } = get();
        if (playerName && gameId && !connected) {
          get().connect(playerName, gameId);
        } else if (playerName && !connected) {
          get().connect(playerName);
        }
      }
    }),
    {
      name: 'fantasy-coup-storage',
      partialize: (state) => ({ 
        playerName: state.playerName, 
        gameId: state.gameId 
      }),
    }
  )
);
