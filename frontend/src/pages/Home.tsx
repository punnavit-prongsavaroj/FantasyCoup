import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function Home() {
  const { connected, connect, playerName } = useGameStore();
  const [inputName, setInputName] = useState(playerName || '');
  const navigate = useNavigate();

  useEffect(() => {
    if (connected) {
      navigate('/lobby');
    }
  }, [connected, navigate]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      connect(inputName);
      navigate('/lobby');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white font-sans">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center border border-gray-700">
        <h1 className="text-4xl font-bold mb-2 text-indigo-400">Fantasy Coup</h1>
        <p className="text-gray-400 mb-6">Deception and manipulation await.</p>
        
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-left text-sm font-medium mb-1 text-gray-300">Enter your name</label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-white"
              placeholder="Player Name"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-lg shadow-indigo-500/20"
          >
            Enter Game
          </button>
        </form>
      </div>
    </div>
  );
}
