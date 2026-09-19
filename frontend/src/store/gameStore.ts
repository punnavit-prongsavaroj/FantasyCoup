import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const playSound = (soundName: string) => {
  try {
    const audio = new Audio(`/sounds/${soundName.toLowerCase()}.wav`);
    audio.volume = 0.6;
    audio.play().catch(e => {
      console.debug(`Sound not found or blocked: ${soundName}`, e);
    });
  } catch (error) {
    // Ignore errors
  }
};

export interface PlayerPublicState {
  name: string;
  coins: number;
  cardCount: number;
  totalCards: number;
  alive: boolean;
  revealedCards: string[];
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
  currentSubscription: any | null;
  
  setPlayerName: (name: string) => void;
  connect: (playerName: string, autoJoinGameId?: string) => void;
  disconnect: () => void;
  joinGame: (gameId: string) => void;
  startGame: () => void;
  takeAction: (actionType: string, targetPlayerName?: string) => void;
  reactToAction: (reactionType: string, roleClaimed?: string) => void;
  loseCard: (cardId: string) => void;
  returnCards: (cardIds: string[]) => void;
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
      currentSubscription: null,

      setPlayerName: (name) => set({ playerName: name }),

      connect: (playerName, autoJoinGameId) => {
        if (get().connected) return;

        const socket = new SockJS(`${API_URL}/ws-game`);
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
        const { stompClient, currentSubscription } = get();
        if (currentSubscription) {
          currentSubscription.unsubscribe();
        }
        if (stompClient) {
          stompClient.deactivate();
        }
        set({ connected: false, stompClient: null, gameId: null, players: [], playersState: [], myHand: [], winnerName: null, pendingAction: null, currentSubscription: null });
      },

      joinGame: (gameId) => {
        const { stompClient, playerName, currentSubscription } = get();
        if (stompClient && stompClient.connected) {
          
          if (currentSubscription) {
            currentSubscription.unsubscribe();
          }

          const sub = stompClient.subscribe(`/topic/game/${gameId}`, (message) => {
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
            if (data.status === 'IN_PROGRESS' || data.status === 'WAITING_FOR_EXCHANGE' || data.status === 'WAITING_FOR_LOSE_CARD') {
              state.fetchMyHand();
            }
          });

          stompClient.publish({
            destination: `/app/game.join`,
            body: JSON.stringify({ gameId, playerName }),
          });
          
          set({ gameId, currentSubscription: sub });
        }
      },

      startGame: () => {
        const { stompClient, gameId, playerName } = get();
        if (stompClient && stompClient.connected && gameId) {
          playSound('start'); // เสียงตอนเริ่มเกม
          stompClient.publish({
            destination: `/app/game.start`,
            body: JSON.stringify({ gameId, playerName }),
          });
        }
      },

      takeAction: (actionType: string, targetPlayerName?: string) => {
        const { stompClient, gameId, playerName } = get();
        if (stompClient && stompClient.connected && gameId) {
          playSound(actionType); // เล่นเสียงตามชื่อ action
          stompClient.publish({
            destination: `/app/game.action`,
            body: JSON.stringify({ gameId, playerName, actionType, targetPlayerName }),
          });
        }
      },

      reactToAction: (reactionType: string, roleClaimed?: string) => {
        const { stompClient, gameId, playerName } = get();
        if (stompClient && stompClient.connected && gameId) {
          playSound(reactionType); // เล่นเสียงตอนกด react (เช่น PASS, CHALLENGE, BLOCK)
          stompClient.publish({
            destination: `/app/game.react`,
            body: JSON.stringify({ gameId, playerName, reactionType, roleClaimed }),
          });
        }
      },

      loseCard: (cardId: string) => {
        const { stompClient, gameId, playerName } = get();
        if (stompClient && stompClient.connected && gameId) {
          playSound('lose_card'); // เสียงตอนทิ้งไพ่
          stompClient.publish({
            destination: `/app/game.loseCard`,
            body: JSON.stringify({ gameId, playerName, cardId }),
          });
        }
      },

      returnCards: (cardIds: string[]) => {
        const { stompClient, gameId, playerName } = get();
        if (stompClient && stompClient.connected && gameId) {
          playSound('exchange'); // สามารถเปลี่ยนเป็นเสียงสลับไพ่ได้
          stompClient.publish({
            destination: `/app/game.returnCards`,
            body: JSON.stringify({ gameId, playerName, cardIds }),
          });
        }
      },

      leaveGame: () => {
        const { stompClient, gameId, playerName, currentSubscription } = get();
        if (stompClient && stompClient.connected && gameId) {
          stompClient.publish({
            destination: `/app/game.leave`,
            body: JSON.stringify({ gameId, playerName }),
          });
        }
        if (currentSubscription) {
          currentSubscription.unsubscribe();
        }
        set({ gameId: null, players: [], playersState: [], myHand: [], winnerName: null, pendingAction: null, gameStatus: 'WAITING', currentSubscription: null });
      },

      fetchMyHand: async () => {
        const { gameId, playerName } = get();
        if (!gameId || !playerName) return;

        try {
          const response = await fetch(`${API_URL}/api/game/${gameId}/player/${playerName}/hand`);
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
