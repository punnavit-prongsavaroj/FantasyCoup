import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import { useGameStore } from './store/gameStore';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { connected, playerName } = useGameStore();
  
  // If not connected and no player name saved, go home
  if (!connected && !playerName) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Global effect to restore connection on load
const ConnectionRestorer = () => {
  const { restoreConnection, connected, playerName, gameId } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);

  // Navigate automatically based on restored state
  useEffect(() => {
    if (connected && gameId) {
      navigate(`/game/${gameId}`);
    } else if (connected && playerName && !gameId) {
      navigate('/lobby');
    }
  }, [connected, gameId, playerName, navigate]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <ConnectionRestorer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/lobby" 
          element={
            <ProtectedRoute>
              <Lobby />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/game/:gameId" 
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
