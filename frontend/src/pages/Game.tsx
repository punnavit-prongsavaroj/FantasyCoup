import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import type { PlayerPublicState } from '../store/gameStore';

// Helper to get nice colors for roles
const getRoleColor = (role: string) => {
  switch(role) {
    case 'KING': return 'bg-purple-600 border-purple-400';
    case 'ADVENTURER': return 'bg-blue-600 border-blue-400';
    case 'ASSASSIN': return 'bg-red-800 border-red-500';
    case 'HOLY_MAIDEN': return 'bg-pink-600 border-pink-400';
    case 'MERCHANT': return 'bg-green-600 border-green-400';
    default: return 'bg-gray-700 border-gray-500';
  }
}

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { 
    connected, playerName, players, playersState, 
    gameStatus, currentTurnPlayer, myHand, 
    joinGame, startGame 
  } = useGameStore();

  useEffect(() => {
    if (connected && gameId && players.length === 0) {
       joinGame(gameId);
    }
  }, [connected, gameId, joinGame, players.length]);

  if (!connected) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Reconnecting to game...</div>;
  }

  return (
    <div className="min-h-screen p-6 flex flex-col bg-gray-900 text-white font-sans">
      <header className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-indigo-400">Room: {gameId}</h2>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${gameStatus === 'IN_PROGRESS' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
            Status: {gameStatus}
          </p>
        </div>
        
        {gameStatus === 'IN_PROGRESS' && (
          <div className="px-6 py-2 bg-indigo-900/50 border border-indigo-500 rounded-lg text-center">
            <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Current Turn</p>
            <p className="font-bold text-lg text-white">{currentTurnPlayer === playerName ? 'YOUR TURN' : currentTurnPlayer}</p>
          </div>
        )}

        <div className="flex gap-4 items-center">
          <div className="text-right">
            <p className="text-sm text-gray-400">Playing as</p>
            <p className="font-bold text-green-400">{playerName}</p>
          </div>
          <button 
            onClick={() => navigate('/lobby')}
            className="px-4 py-2 bg-gray-700 hover:bg-red-600/80 rounded-lg text-sm font-medium transition shadow-sm"
          >
            Leave
          </button>
        </div>
      </header>

      <main className="flex-1 flex gap-6">
        {/* Players Sidebar */}
        <aside className="w-64 bg-gray-800 rounded-xl border border-gray-700 p-4 flex flex-col shadow-md">
          <h3 className="font-bold text-gray-300 mb-4 uppercase tracking-wider text-sm">
            Players ({players.length}/6)
          </h3>
          <ul className="space-y-3 flex-1 overflow-y-auto">
            {playersState.length > 0 ? (
              // Show detailed state if game started or lobby synced
              playersState.map((player: PlayerPublicState, index) => (
                <li key={index} className={`flex flex-col p-3 rounded-lg border ${
                    currentTurnPlayer === player.name ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' :
                    player.name === playerName ? 'bg-gray-700/80 border-gray-500' : 'bg-gray-800 border-gray-700'
                  } ${!player.isAlive && 'opacity-50'}`}>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold ${player.name === playerName ? 'text-green-400' : 'text-gray-200'}`}>
                      {player.name} {player.name === playerName && '(You)'}
                    </span>
                    {!player.isAlive && <span className="text-xs text-red-400 font-bold uppercase">Dead</span>}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                      {player.coins} Coins
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-4 bg-blue-300 rounded-sm inline-block"></span>
                      {player.cardCount} Cards
                    </span>
                  </div>
                </li>
              ))
            ) : (
              // Show basic list before syncing
              players.map((player, index) => (
                <li key={index} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 text-gray-200">
                  {player} {player === playerName && '(You)'}
                </li>
              ))
            )}
            
            {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
              <li key={`empty-${i}`} className="p-3 border border-dashed border-gray-700 rounded-lg text-gray-600 text-sm text-center">
                Empty Slot
              </li>
            ))}
          </ul>
        </aside>

        {/* Game Board Area */}
        <section className="flex-1 bg-gray-800/40 rounded-xl border border-gray-700 p-6 flex flex-col relative shadow-inner">
          
          {gameStatus === 'WAITING' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h1 className="text-4xl font-bold mb-4 text-gray-200">Waiting Room</h1>
              {players.length >= 2 ? (
                <button 
                  onClick={startGame}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xl transition shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105"
                >
                  Start Game
                </button>
              ) : (
                <p className="text-gray-400 bg-gray-800 p-4 rounded-lg border border-gray-700">
                  Need at least 2 players to start...
                </p>
              )}
            </div>
          )}

          {gameStatus === 'IN_PROGRESS' && (
            <>
              {/* Center Board (Actions / Logs) */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center opacity-30">
                  <h1 className="text-5xl font-bold mb-2">Fantasy Coup</h1>
                  <p>Action logs and prompts will appear here.</p>
                </div>
              </div>

              {/* Player's Cards Area (Bottom) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="flex gap-4 mb-2">
                  {myHand.map((card, i) => (
                    <div 
                      key={card.id || i} 
                      className={`w-36 h-56 rounded-xl flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group border-2 transition-transform hover:-translate-y-2
                        ${card.revealed ? 'bg-gray-800 border-red-800 grayscale' : getRoleColor(card.role)}`}
                    >
                      {card.revealed && (
                        <div className="absolute inset-0 bg-red-900/40 z-10 flex items-center justify-center">
                          <span className="text-red-500 font-bold text-2xl -rotate-45 border-4 border-red-500 p-2 rounded">DEAD</span>
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2 text-white/50 text-xs font-bold">{card.role}</div>
                      
                      <h3 className="relative z-10 font-black text-xl text-white tracking-widest drop-shadow-md">
                        {card.role}
                      </h3>
                      
                      {/* Decorative patterns */}
                      <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  ))}
                  
                  {myHand.length === 0 && (
                    <div className="text-gray-500 flex items-center justify-center h-24">
                      Loading your hand...
                    </div>
                  )}
                </div>
                <div className="bg-gray-800 px-6 py-2 rounded-full border border-gray-700 font-medium text-gray-300">
                  Your Cards (Do not show anyone)
                </div>
              </div>
            </>
          )}

        </section>
      </main>
    </div>
  );
}
