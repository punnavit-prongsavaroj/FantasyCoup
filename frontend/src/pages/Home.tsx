import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Home() {
  const { connected, connect, playerName } = useGameStore();
  const [inputName, setInputName] = useState(playerName || '');
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (connected) {
      navigate('/lobby');
    }
  }, [connected, navigate]);

  useEffect(() => {
    // Check server status periodically
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/game/health`);
        if (res.ok) {
          setServerStatus('online');
          setIsStarting(false);
        } else {
          setServerStatus('offline');
        }
      } catch (e) {
        setServerStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverStatus !== 'online') {
      alert("Server is offline. Please wait or start the server.");
      return;
    }
    if (inputName.trim()) {
      connect(inputName);
      navigate('/lobby');
    }
  };

  const handleStartServer = async () => {
    setIsStarting(true);
    try {
      await fetch('/__dev/start-backend', { method: 'POST' });
    } catch (e) {
      console.error("Failed to start server", e);
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Server Status Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-gray-700/50 backdrop-blur-sm">
        <div className={`w-2.5 h-2.5 rounded-full ${
          serverStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 
          serverStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
        }`} />
        <span className="text-sm font-medium text-gray-200">
          Server: {serverStatus === 'online' ? 'Online' : serverStatus === 'checking' ? 'Checking...' : 'Offline'}
        </span>
        {serverStatus === 'offline' && import.meta.env.DEV && (
          <button 
            onClick={handleStartServer}
            disabled={isStarting}
            className="ml-2 px-2 py-0.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:opacity-50 transition-colors"
          >
            {isStarting ? 'Starting...' : 'Run Server'}
          </button>
        )}
      </div>

      <div 
        className="panel-parchment p-8 max-w-md w-full text-center"
      >
        <h1 
          className="text-4xl font-bold mb-2"
          style={{ fontFamily: "'Cinzel Decorative', serif", color: 'var(--gold-light)', textShadow: '0 2px 8px rgba(184,134,11,.3)' }}
        >
          Fantasy Coup
        </h1>
        <p className="mb-4" style={{ color: 'var(--ink-light)', fontFamily: "'Noto Sans Thai', serif" }}>
          Deception and manipulation await.
        </p>

        {/* Gold ornament divider */}
        <div className="divider-gold" style={{ width: '60%', margin: '0 auto 24px' }}>
          <span className="line" />
          <span className="ornament">❧</span>
          <span className="line" />
        </div>
        
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label 
              className="block text-left text-sm font-medium mb-1"
              style={{ color: 'var(--ink)', fontFamily: "'Cinzel', serif" }}
            >
              Enter your name
            </label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="input-parchment w-full"
              placeholder="Player Name"
              required
              disabled={serverStatus !== 'online'}
            />
          </div>
          <button 
            type="submit"
            className="btn-wood w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={serverStatus !== 'online'}
          >
            {serverStatus === 'online' ? 'Enter Game' : 'Server Offline'}
          </button>
        </form>
      </div>
    </div>
  );
}
