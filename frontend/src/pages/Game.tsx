import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { connected, playerName, players, gameStatus, joinGame } = useGameStore();

  useEffect(() => {
    if (!connected || !playerName) {
      navigate('/');
      return;
    }
    
    // Auto join on page load/refresh if store lost the game state but still connected
    if (gameId && players.length === 0) {
       joinGame(gameId);
    }
  }, [connected, playerName, gameId, navigate, joinGame, players.length]);

  return (
    <div className="min-h-screen p-6 flex flex-col bg-gray-900 text-white">
      <header className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-indigo-400">Room: {gameId}</h2>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
            Status: {gameStatus}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <p className="text-sm text-gray-400">Playing as</p>
            <p className="font-bold text-green-400">{playerName}</p>
          </div>
          <button 
            onClick={() => navigate('/lobby')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition shadow-sm"
          >
            Leave Room
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
            {players.map((player, index) => (
              <li key={index} className={`flex justify-between items-center p-3 rounded-lg border ${player === playerName ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-gray-700/50 border-gray-600'}`}>
                <span className={`font-medium ${player === playerName ? 'text-indigo-300' : 'text-gray-200'}`}>
                  {player} {player === playerName && '(You)'}
                </span>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-md font-bold">
                  2 Coins
                </span>
              </li>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
              <li key={`empty-${i}`} className="p-3 border border-dashed border-gray-600 rounded-lg text-gray-600 text-sm text-center flex items-center justify-center">
                Waiting for player...
              </li>
            ))}
          </ul>
        </aside>

        {/* Game Board Area */}
        <section className="flex-1 bg-gray-800/50 rounded-xl border border-gray-700 p-6 flex flex-col items-center justify-center relative shadow-inner">
          
          <div className="text-center opacity-80 mb-12">
            <h1 className="text-4xl font-bold mb-3 text-gray-200">Game Board</h1>
            {players.length >= 2 ? (
              <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-lg transition shadow-lg shadow-indigo-500/30">
                Start Game
              </button>
            ) : (
              <p className="text-gray-400">Waiting for more players to join... (Need at least 2)</p>
            )}
          </div>

          {/* Player's Cards Area (Bottom) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="flex gap-4">
              <div className="w-32 h-48 bg-gray-700 border-2 border-gray-600 rounded-xl flex items-center justify-center text-gray-400 shadow-xl relative overflow-hidden group hover:border-indigo-500 transition cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-0"></div>
                <span className="relative z-10 font-medium group-hover:text-white transition">Hidden Card</span>
              </div>
              <div className="w-32 h-48 bg-gray-700 border-2 border-gray-600 rounded-xl flex items-center justify-center text-gray-400 shadow-xl relative overflow-hidden group hover:border-indigo-500 transition cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-0"></div>
                <span className="relative z-10 font-medium group-hover:text-white transition">Hidden Card</span>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-3 font-medium">Your Hand</p>
          </div>
        </section>
      </main>
    </div>
  );
}
