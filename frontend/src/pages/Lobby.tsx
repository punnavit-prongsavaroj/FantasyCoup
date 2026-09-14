import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Users, Plus, LogOut } from 'lucide-react';

export default function Lobby() {
  const { connected, playerName, disconnect, joinGame } = useGameStore();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    if (!connected || !playerName) {
      navigate('/');
    }
  }, [connected, playerName, navigate]);

  const handleCreateGame = () => {
    // Usually we would make a POST request to backend to create a game,
    // and then join via websocket using the generated ID.
    // For now, let's mock it.
    const mockGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    joinGame(mockGameId);
    navigate(`/game/${mockGameId}`);
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      joinGame(roomCode.toUpperCase());
      navigate(`/game/${roomCode.toUpperCase()}`);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Game Lobby</h1>
          <div className="px-3 py-1 bg-green-900/40 border border-green-500/50 rounded-full text-green-400 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {playerName}
          </div>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleCreateGame}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} />
            Create New Game
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <form onSubmit={handleJoinGame} className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Join with Room Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-white uppercase text-center tracking-widest font-mono"
                placeholder="ABCDEF"
                maxLength={6}
              />
              <button 
                type="submit"
                disabled={!roomCode.trim()}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:hover:bg-gray-700 text-white font-medium rounded-lg transition flex items-center justify-center"
              >
                <Users size={20} />
              </button>
            </div>
          </form>

          <button 
            onClick={handleDisconnect}
            className="w-full py-3 mt-6 bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
