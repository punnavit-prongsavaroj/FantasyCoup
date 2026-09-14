import { useState } from 'react';
import { useGameStore } from './store/gameStore';

function App() {
  const { connected, connect, disconnect, playerName, setPlayerName } = useGameStore();
  const [inputName, setInputName] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      connect(inputName);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-6 text-indigo-400">Fantasy Coup</h1>
        
        {!connected ? (
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-left text-sm font-medium mb-1">Enter your name</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="Player Name"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
            >
              Connect to Server
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-300">
              Connected as <span className="font-bold">{playerName}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
                Create Game
              </button>
              <button className="py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition">
                Join Game
              </button>
            </div>
            <button 
              onClick={disconnect}
              className="w-full py-2 mt-4 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/50 rounded-lg transition"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
