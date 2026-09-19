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
    <div className="min-h-screen flex items-center justify-center p-4">
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
            />
          </div>
          <button 
            type="submit"
            className="btn-wood w-full py-3 text-lg"
          >
            Enter Game
          </button>
        </form>
      </div>
    </div>
  );
}
