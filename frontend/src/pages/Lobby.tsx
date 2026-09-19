import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Users, Plus, LogOut } from 'lucide-react';

export default function Lobby() {
  const { connected, playerName, disconnect, joinGame } = useGameStore();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  const handleCreateGame = () => {
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="panel-parchment p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 
            className="text-2xl font-bold"
            style={{ fontFamily: "'Cinzel Decorative', serif", color: 'var(--gold-light)' }}
          >
            Game Lobby
          </h1>
          <div 
            className="px-3 py-1 text-sm font-medium flex items-center gap-2"
            style={{
              background: 'linear-gradient(to right, var(--forest), #1a4d23)',
              border: '2px solid var(--brass)',
              color: 'var(--text-on-dark)',
              borderRadius: 'var(--radius)'
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--gold-light)' }} />
            {playerName}
          </div>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleCreateGame}
            className="btn-wood w-full py-4 text-base"
          >
            <Plus size={20} />
            Create New Game
          </button>

          {/* Gold ornament divider */}
          <div className="divider-gold">
            <span className="line" />
            <span className="ornament" style={{ fontFamily: "'Cinzel', serif" }}>❧ OR ❧</span>
            <span className="line" />
          </div>

          <form onSubmit={handleJoinGame} className="space-y-3">
            <label 
              className="block text-sm font-medium"
              style={{ color: 'var(--ink)', fontFamily: "'Cinzel', serif" }}
            >
              Join with Room Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="input-parchment flex-1 uppercase text-center tracking-widest font-mono"
                placeholder="ABCDEF"
                maxLength={6}
              />
              <button 
                type="submit"
                disabled={!roomCode.trim()}
                className="btn-wood px-6 py-3 disabled:opacity-50"
              >
                <Users size={20} />
              </button>
            </div>
          </form>

          <button 
            onClick={handleDisconnect}
            className="w-full py-3 mt-6 flex items-center justify-center gap-2 transition hover:opacity-80"
            style={{
              background: 'transparent',
              border: '2px solid var(--ember)',
              color: 'var(--ember)',
              fontFamily: "'Cinzel', serif",
              borderRadius: 'var(--radius)'
            }}
          >
            <LogOut size={18} />
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
