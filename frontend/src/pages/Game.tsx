import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { connected, playerName, joinGame } = useGameStore();

  useEffect(() => {
    if (!connected || !playerName) {
      navigate('/');
      return;
    }
    
    // In a real app, joining logic might happen here if refreshed
    // joinGame(gameId!);
  }, [connected, playerName, navigate]);

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <header className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
        <div>
          <h2 className="text-xl font-bold text-indigo-400">Room: {gameId}</h2>
          <p className="text-sm text-gray-400">Waiting for players...</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <p className="text-sm text-gray-400">Playing as</p>
            <p className="font-bold text-white">{playerName}</p>
          </div>
          <button 
            onClick={() => navigate('/lobby')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition"
          >
            Leave
          </button>
        </div>
      </header>

      <main className="flex-1 flex gap-6">
        {/* Players Sidebar */}
        <aside className="w-64 bg-gray-800 rounded-xl border border-gray-700 p-4">
          <h3 className="font-bold text-gray-300 mb-4 uppercase tracking-wider text-sm">Players (1/6)</h3>
          <ul className="space-y-2">
            <li className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600">
              <span className="font-medium">{playerName} (You)</span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-md">2 Coins</span>
            </li>
            {/* Mock waiting player slots */}
            <li className="p-3 border border-dashed border-gray-600 rounded-lg text-gray-500 text-sm text-center">
              Waiting for player...
            </li>
          </ul>
        </aside>

        {/* Game Board Area */}
        <section className="flex-1 bg-gray-800/50 rounded-xl border border-gray-700 p-6 flex flex-col items-center justify-center relative">
          
          <div className="text-center opacity-50">
            <h1 className="text-4xl font-bold mb-2">Game Board</h1>
            <p>The game will start once the host initiates.</p>
          </div>

          {/* Player's Cards Area (Bottom) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="flex gap-4">
              <div className="w-32 h-48 bg-gray-700 border-2 border-gray-600 rounded-xl flex items-center justify-center text-gray-400 shadow-xl">
                Card 1
              </div>
              <div className="w-32 h-48 bg-gray-700 border-2 border-gray-600 rounded-xl flex items-center justify-center text-gray-400 shadow-xl">
                Card 2
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
