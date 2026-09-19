import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import type { PlayerPublicState } from '../store/gameStore';

// Card image map
const getCardImage = (role: string) => `/cards/${role.toLowerCase()}.jpg`;

// Seat positions around the table (excluding self at bottom)
// Returns positions as % of the game-table-container
const getSeatPositions = (count: number): { x: number; y: number }[] => {
  const positions: { x: number; y: number }[] = [];
  if (count === 0) return positions;
  
  if (count === 1) {
    // Single opponent: directly across (top center)
    positions.push({ x: 50, y: 12 });
  } else if (count === 2) {
    positions.push({ x: 25, y: 15 });
    positions.push({ x: 75, y: 15 });
  } else if (count === 3) {
    positions.push({ x: 15, y: 25 });
    positions.push({ x: 50, y: 8 });
    positions.push({ x: 85, y: 25 });
  } else if (count === 4) {
    positions.push({ x: 10, y: 35 });
    positions.push({ x: 28, y: 10 });
    positions.push({ x: 72, y: 10 });
    positions.push({ x: 90, y: 35 });
  } else {
    // 5 opponents: spread evenly across top arc
    positions.push({ x: 8, y: 40 });
    positions.push({ x: 18, y: 12 });
    positions.push({ x: 50, y: 5 });
    positions.push({ x: 82, y: 12 });
    positions.push({ x: 92, y: 40 });
  }
  
  return positions;
};

// Opponent card component
function OpponentCard({ role, isRevealed }: { role?: string; isRevealed: boolean }) {
  if (isRevealed && role) {
    return (
      <div
        className="card-revealed opponent-card"
        style={{ backgroundImage: `url(${getCardImage(role)})` }}
      >
        <div className="card-dead-overlay">
          <span style={{ fontSize: '16px' }}>💀</span>
        </div>
      </div>
    );
  }
  return <div className="card-back opponent-card" />;
}

// Opponent seat component
function OpponentSeat({ 
  player, 
  x, y, 
  isTurn 
}: { 
  player: PlayerPublicState; 
  x: number; y: number; 
  isTurn: boolean;
}) {
  // Build card list: revealed cards first, then hidden cards
  const cards: { isRevealed: boolean; role?: string }[] = [];
  
  // Add revealed cards
  if (player.revealedCards) {
    player.revealedCards.forEach(role => {
      cards.push({ isRevealed: true, role });
    });
  }
  
  // Add hidden cards (cardCount = unrevealed count)
  for (let i = 0; i < player.cardCount; i++) {
    cards.push({ isRevealed: false });
  }

  return (
    <div
      className="opponent-seat"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* Cards */}
      <div className="flex gap-1">
        {cards.map((card, i) => (
          <OpponentCard key={i} role={card.role} isRevealed={card.isRevealed} />
        ))}
        {cards.length === 0 && (
          <div className="opponent-card" style={{ opacity: 0.3, border: '1px dashed var(--brass)', borderRadius: 'var(--radius)' }} />
        )}
      </div>
      
      {/* Name tag */}
      <span className={`player-nametag ${isTurn ? 'is-turn' : ''} ${!player.alive ? 'is-dead' : ''}`}>
        {player.name}
      </span>
      
      {/* Coins */}
      {player.alive && (
        <span className="coins-badge">🪙 {player.coins}</span>
      )}
    </div>
  );
}

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { 
    connected, playerName, players, playersState, 
    gameStatus, currentTurnPlayer, myHand, 
    joinGame, startGame, leaveGame
  } = useGameStore();

  const [targetAction, setTargetAction] = useState<string | null>(null);
  const [blocking, setBlocking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedCardsToReturn, setSelectedCardsToReturn] = useState<string[]>([]);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // joinGame is handled by Lobby.tsx or App.tsx (via restoreConnection).
  // Auto-joining here causes a bug where leaving the game immediately rejoins.

  // Handle Background Music
  useEffect(() => {
    const audio = new Audio('/sounds/bgm.wav');
    audio.loop = true;
    audio.volume = 0.25;
    bgmRef.current = audio;
    audio.play().catch(() => console.debug("BGM autoplay blocked waiting for interaction"));
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggleMute = () => {
    if (bgmRef.current) {
      bgmRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (bgmRef.current.paused && !isMuted) {
        bgmRef.current.play().catch(() => {});
      }
    }
  };

  // Separate self from opponents
  const opponents = playersState.filter(p => p.name !== playerName);
  const selfPlayer = playersState.find(p => p.name === playerName);
  const seatPositions = getSeatPositions(opponents.length);

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--text-on-dark)' }}>
        <div className="panel-parchment p-6">Reconnecting to game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Noto Sans Thai', 'Cinzel', serif" }}>
      {/* Torches */}
      <div className="torch-left">
        <div className="torch-flame" />
        <div className="torch-handle" />
      </div>
      <div className="torch-right">
        <div className="torch-flame" />
        <div className="torch-handle" />
      </div>
      <div className="torch-glow-effect left" />
      <div className="torch-glow-effect right" />

      {/* HEADER */}
      <header 
        className="flex justify-between items-center p-4 m-4 mb-0"
        style={{
          background: 'linear-gradient(160deg, var(--parchment), var(--parchment-aged))',
          border: '3px solid var(--brass)',
          borderRadius: 'var(--radius)',
          boxShadow: 'inset 0 1px 0 rgba(255,220,160,.3), 0 4px 12px var(--shadow-warm)',
          color: 'var(--ink)',
        }}
      >
        <div>
          <h2 
            className="text-xl font-bold"
            style={{ fontFamily: "'Cinzel', serif", color: 'var(--gold)' }}
          >
            ⚔ Room: {gameId}
          </h2>
          <p className="text-sm flex items-center gap-2" style={{ color: 'var(--ink-light)' }}>
            <span 
              className={`w-2 h-2 rounded-full ${gameStatus === 'IN_PROGRESS' ? '' : 'animate-pulse'}`}
              style={{ backgroundColor: gameStatus === 'IN_PROGRESS' ? 'var(--forest)' : 'var(--gold)' }}
            />
            Status: {gameStatus}
          </p>
        </div>
        
        {gameStatus === 'IN_PROGRESS' && (
          <div 
            className="px-6 py-2 text-center"
            style={{
              background: 'linear-gradient(to bottom, var(--velvet-light), var(--velvet))',
              border: '2px solid var(--brass)',
              borderRadius: 'var(--radius)',
              boxShadow: '0 0 15px rgba(110,27,27,.3)',
            }}
          >
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--gold-light)', fontFamily: "'Cinzel', serif" }}>Current Turn</p>
            <p className="font-bold text-lg" style={{ color: 'var(--text-on-dark)', fontFamily: "'Cinzel', serif" }}>
              {currentTurnPlayer === playerName ? '⚔ YOUR TURN' : currentTurnPlayer}
            </p>
          </div>
        )}

        <div className="flex gap-3 items-center">
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--ink-light)' }}>Playing as</p>
            <p className="font-bold" style={{ color: 'var(--forest)', fontFamily: "'Cinzel', serif" }}>{playerName}</p>
          </div>
          
          <button 
            onClick={toggleMute}
            className="btn-wood w-10 h-10 p-0 text-sm"
            title={isMuted ? "Unmute Music" : "Mute Music"}
          >
            {isMuted ? '🔇' : '🎵'}
          </button>

          <button 
            onClick={() => {
              leaveGame();
              navigate('/lobby');
            }}
            className="btn-wood px-3 py-2 text-sm"
            style={{
              background: 'linear-gradient(to bottom, var(--velvet-light), var(--velvet))',
              borderColor: 'var(--ember)',
            }}
          >
            Leave
          </button>
        </div>
      </header>

      {/* MAIN GAME AREA */}
      <main className="flex-1 relative p-4" style={{ overflow: 'visible' }}>
        <div className="game-table-container">
          {/* Round Table */}
          <div className="round-table">
            <div className="table-center-content">
              
              {/* WAITING STATE */}
              {gameStatus === 'WAITING' && (
                <div>
                  <h1 
                    className="text-2xl font-bold mb-4"
                    style={{ fontFamily: "'Cinzel Decorative', serif", color: 'var(--text-on-dark)' }}
                  >
                    Waiting Room
                  </h1>
                  <p className="text-sm mb-2" style={{ color: 'var(--parchment-aged)' }}>
                    {players.length}/6 players
                  </p>
                  {players.length >= 2 ? (
                    <button onClick={startGame} className="btn-wood text-base px-6 py-3">
                      Start Game
                    </button>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--parchment-aged)' }}>
                      Need at least 2 players...
                    </p>
                  )}
                </div>
              )}

              {/* FINISHED STATE */}
              {gameStatus === 'FINISHED' && (
                <div>
                  <h1 
                    className="text-3xl font-black mb-3"
                    style={{ fontFamily: "'Cinzel Decorative', serif", color: 'var(--gold-light)', textShadow: '0 0 15px rgba(232,180,74,.5)' }}
                  >
                    GAME OVER
                  </h1>
                  <p className="text-lg mb-4" style={{ color: 'var(--text-on-dark)' }}>
                    Winner: <span className="font-bold" style={{ color: 'var(--gold-light)' }}>{useGameStore.getState().winnerName}</span>
                  </p>
                  <button 
                    onClick={() => { leaveGame(); navigate('/lobby'); }}
                    className="btn-wood px-6 py-3"
                  >
                    Back to Lobby
                  </button>
                </div>
              )}

              {/* ACTION_PENDING STATE */}
              {gameStatus === 'ACTION_PENDING' && useGameStore.getState().pendingAction && (
                <div className="text-left" style={{ padding: '0 8px' }}>
                  <h2 className="text-lg font-black mb-2 text-center" style={{ fontFamily: "'Cinzel', serif", color: 'var(--gold-light)' }}>
                    ⚔ Action Declared
                  </h2>
                  <p className="text-sm mb-3 text-center" style={{ color: 'var(--text-on-dark)' }}>
                    <span className="font-bold" style={{ color: 'var(--gold-light)' }}>{useGameStore.getState().pendingAction?.sourcePlayer}</span>
                    {' → '}
                    <span className="font-bold" style={{ color: 'var(--ember-light)' }}>{useGameStore.getState().pendingAction?.actionType}</span>
                    {useGameStore.getState().pendingAction?.targetPlayer && (
                      <> on <span className="font-bold" style={{ color: 'var(--ember)' }}>{useGameStore.getState().pendingAction?.targetPlayer}</span></>
                    )}
                  </p>
                  <p className="text-xs mb-3 text-center" style={{ color: 'var(--parchment-aged)' }}>
                    {useGameStore.getState().pendingAction?.passedPlayers?.length || 0} / {Math.max(1, playersState.filter(p => p.alive).length - 1)} passed
                  </p>

                  {playerName === useGameStore.getState().pendingAction?.sourcePlayer ? (
                    <p className="text-sm text-center animate-pulse" style={{ color: 'var(--parchment-aged)' }}>Waiting for others...</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {!blocking ? (
                        <div className="flex gap-2 justify-center flex-wrap">
                          <button 
                            onClick={() => useGameStore.getState().reactToAction('PASS')}
                            disabled={useGameStore.getState().pendingAction?.passedPlayers?.includes(playerName)}
                            className="btn-wood text-xs px-3 py-2 disabled:opacity-40"
                          >Pass</button>
                          
                          <button 
                            onClick={() => useGameStore.getState().reactToAction('CHALLENGE')}
                            className="btn-velvet text-xs px-3 py-2"
                          >Challenge!</button>
                          
                          {['FOREIGN_AID', 'ASSASSINATE', 'STEAL'].includes(useGameStore.getState().pendingAction?.actionType || '') && (
                            <button 
                              onClick={() => setBlocking(true)}
                              className="btn-arcane text-xs px-3 py-2"
                            >Block</button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 items-center">
                          <p className="text-xs font-bold" style={{ color: 'var(--gold-light)', fontFamily: "'Cinzel', serif" }}>Block with:</p>
                          <div className="flex gap-2 flex-wrap justify-center">
                            {useGameStore.getState().pendingAction?.actionType === 'FOREIGN_AID' && (
                              <button onClick={() => { setBlocking(false); useGameStore.getState().reactToAction('BLOCK', 'KING'); }} className="btn-arcane text-xs px-2 py-1">👑 King</button>
                            )}
                            {useGameStore.getState().pendingAction?.actionType === 'ASSASSINATE' && (
                              <button onClick={() => { setBlocking(false); useGameStore.getState().reactToAction('BLOCK', 'HOLY_MAIDEN'); }} className="btn-arcane text-xs px-2 py-1">🛡️ Holy Maiden</button>
                            )}
                            {useGameStore.getState().pendingAction?.actionType === 'STEAL' && (
                              <>
                                <button onClick={() => { setBlocking(false); useGameStore.getState().reactToAction('BLOCK', 'HERO'); }} className="btn-arcane text-xs px-2 py-1">🗡️ Hero</button>
                                <button onClick={() => { setBlocking(false); useGameStore.getState().reactToAction('BLOCK', 'MERCHANT'); }} className="btn-arcane text-xs px-2 py-1">📜 Merchant</button>
                              </>
                            )}
                            <button onClick={() => setBlocking(false)} className="btn-wood text-xs px-2 py-1">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* BLOCK_PENDING STATE */}
              {gameStatus === 'BLOCK_PENDING' && useGameStore.getState().pendingAction && (
                <div style={{ padding: '0 8px' }}>
                  <h2 className="text-lg font-black mb-2 text-center" style={{ fontFamily: "'Cinzel', serif", color: 'var(--water)' }}>
                    🛡️ Block Declared
                  </h2>
                  <p className="text-sm mb-3 text-center" style={{ color: 'var(--text-on-dark)' }}>
                    <span className="font-bold" style={{ color: 'var(--gold-light)' }}>{useGameStore.getState().pendingAction?.blockClaimBy}</span>
                    {' blocked with '}
                    <span className="font-bold" style={{ color: 'var(--arcane)' }}>{useGameStore.getState().pendingAction?.blockRoleClaimed}</span>
                  </p>
                  <p className="text-xs mb-3 text-center" style={{ color: 'var(--parchment-aged)' }}>
                    {useGameStore.getState().pendingAction?.passedPlayers?.length || 0} / {Math.max(1, playersState.filter(p => p.alive).length - 1)} passed
                  </p>

                  {playerName === useGameStore.getState().pendingAction?.blockClaimBy ? (
                    <p className="text-sm text-center animate-pulse" style={{ color: 'var(--parchment-aged)' }}>Waiting for response...</p>
                  ) : (
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => useGameStore.getState().reactToAction('PASS')}
                        disabled={useGameStore.getState().pendingAction?.passedPlayers?.includes(playerName)}
                        className="btn-wood text-xs px-3 py-2 disabled:opacity-40"
                      >Pass</button>
                      <button 
                        onClick={() => useGameStore.getState().reactToAction('CHALLENGE')}
                        className="btn-velvet text-xs px-3 py-2"
                      >Challenge!</button>
                    </div>
                  )}
                </div>
              )}

              {/* WAITING_FOR_EXCHANGE STATE */}
              {gameStatus === 'WAITING_FOR_EXCHANGE' && useGameStore.getState().pendingAction && (
                <div style={{ padding: '0 8px' }}>
                  <h2 className="text-lg font-black mb-2 text-center" style={{ fontFamily: "'Cinzel', serif", color: 'var(--forest)' }}>
                    📜 Exchange Cards
                  </h2>
                  {useGameStore.getState().pendingAction?.playerToLoseCard === playerName ? (
                    <>
                      <p className="text-sm mb-3 text-center" style={{ color: 'var(--text-on-dark)' }}>
                        Select <span className="font-bold" style={{ color: 'var(--ember-light)' }}>1</span> card to return.
                      </p>
                      <button 
                        onClick={() => {
                          if (selectedCardsToReturn.length === 1) {
                            useGameStore.getState().returnCards(selectedCardsToReturn);
                            setSelectedCardsToReturn([]);
                          }
                        }}
                        disabled={selectedCardsToReturn.length !== 1}
                        className="btn-wood text-xs px-4 py-2 mx-auto block disabled:opacity-40"
                      >
                        Confirm ({selectedCardsToReturn.length}/1)
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-center animate-pulse" style={{ color: 'var(--parchment-aged)' }}>
                      Waiting for {useGameStore.getState().pendingAction?.playerToLoseCard}...
                    </p>
                  )}
                </div>
              )}

              {/* WAITING_FOR_LOSE_CARD STATE */}
              {gameStatus === 'WAITING_FOR_LOSE_CARD' && useGameStore.getState().pendingAction && (
                <div style={{ padding: '0 8px' }}>
                  <h2 className="text-lg font-black mb-2 text-center" style={{ fontFamily: "'Cinzel', serif", color: 'var(--ember)' }}>
                    💀 Lose a Card
                  </h2>
                  <p className="text-sm mb-3 text-center" style={{ color: 'var(--text-on-dark)' }}>
                    <span className="font-bold" style={{ color: 'var(--gold-light)' }}>{useGameStore.getState().pendingAction?.playerToLoseCard}</span> must discard.
                  </p>
                  {playerName === useGameStore.getState().pendingAction?.playerToLoseCard ? (
                    <p className="text-xs text-center animate-pulse font-bold" style={{ color: 'var(--gold-light)' }}>Select a card below!</p>
                  ) : (
                    <p className="text-sm text-center animate-pulse" style={{ color: 'var(--parchment-aged)' }}>Waiting...</p>
                  )}
                </div>
              )}

              {/* IN_PROGRESS — YOUR TURN ACTIONS */}
              {gameStatus === 'IN_PROGRESS' && (
                <div>
                  {currentTurnPlayer === playerName ? (
                    <div>
                      <h2 className="text-lg font-black mb-3 text-center" style={{ fontFamily: "'Cinzel', serif", color: 'var(--gold-light)' }}>
                        ⚔ Your Turn
                      </h2>
                      
                      {!targetAction ? (
                        <div className="grid grid-cols-2 gap-2" style={{ fontSize: '11px' }}>
                          <button onClick={() => useGameStore.getState().takeAction('INCOME')} className="btn-wood text-xs py-2 px-1 flex flex-col items-center gap-0.5">
                            <span>🪙</span><span>Income</span><span style={{ color: 'var(--gold-light)', fontSize: '9px' }}>+1</span>
                          </button>
                          <button onClick={() => useGameStore.getState().takeAction('FOREIGN_AID')} className="btn-wood text-xs py-2 px-1 flex flex-col items-center gap-0.5">
                            <span>💰</span><span>Foreign Aid</span><span style={{ color: 'var(--gold-light)', fontSize: '9px' }}>+2</span>
                          </button>
                          <button onClick={() => setTargetAction('COUP')} className="btn-velvet text-xs py-2 px-1 flex flex-col items-center gap-0.5">
                            <span>⚔️</span><span>Coup</span><span style={{ color: 'var(--ember-light)', fontSize: '9px' }}>-7</span>
                          </button>
                          <button onClick={() => useGameStore.getState().takeAction('TAX')} className="btn-arcane text-xs py-2 px-1 flex flex-col items-center gap-0.5">
                            <span>👑</span><span>Tax</span><span style={{ color: 'var(--gold-light)', fontSize: '9px' }}>+3</span>
                          </button>
                          <button onClick={() => setTargetAction('ASSASSINATE')} className="btn-velvet text-xs py-2 px-1 flex flex-col items-center gap-0.5">
                            <span>🗡️</span><span>Assassinate</span><span style={{ color: 'var(--ember-light)', fontSize: '9px' }}>-3</span>
                          </button>
                          <button onClick={() => setTargetAction('STEAL')} className="btn-arcane text-xs py-2 px-1 flex flex-col items-center gap-0.5">
                            <span>🗡️</span><span>Steal</span><span style={{ color: 'var(--gold-light)', fontSize: '9px' }}>+2</span>
                          </button>
                          <button onClick={() => useGameStore.getState().takeAction('EXCHANGE')} className="btn-wood text-xs py-2 px-1 flex flex-col items-center gap-0.5 col-span-2">
                            <span>📜</span><span>Exchange</span><span style={{ color: 'var(--gold-light)', fontSize: '9px' }}>Swap</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 items-center">
                          <p className="text-xs font-bold" style={{ color: 'var(--gold-light)', fontFamily: "'Cinzel', serif" }}>
                            Target for {targetAction}:
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {playersState
                              .filter(p => p.alive && p.name !== playerName)
                              .map(p => (
                                <button 
                                  key={p.name}
                                  onClick={() => {
                                    useGameStore.getState().takeAction(targetAction, p.name);
                                    setTargetAction(null);
                                  }}
                                  className="btn-velvet text-xs px-3 py-2"
                                >
                                  🎯 {p.name}
                                </button>
                            ))}
                          </div>
                          <button onClick={() => setTargetAction(null)} className="btn-wood text-xs px-4 py-1">Cancel</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center" style={{ opacity: 0.7 }}>
                      <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "'Cinzel', serif", color: 'var(--text-on-dark)' }}>
                        Waiting for {currentTurnPlayer}
                      </h1>
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--gold-light)', animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--gold-light)', animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--gold-light)', animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* OPPONENT SEATS AROUND TABLE */}
          {gameStatus !== 'WAITING' && opponents.map((player, index) => {
            const pos = seatPositions[index];
            if (!pos) return null;
            return (
              <OpponentSeat
                key={player.name}
                player={player}
                x={pos.x}
                y={pos.y}
                isTurn={currentTurnPlayer === player.name}
              />
            );
          })}

          {/* WAITING STATE — show player list around table */}
          {gameStatus === 'WAITING' && players
            .filter(p => p !== playerName)
            .map((name, index) => {
              const positions = getSeatPositions(players.length - 1);
              const pos = positions[index];
              if (!pos) return null;
              return (
                <div
                  key={name}
                  className="opponent-seat"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className="card-back opponent-card" />
                  <span className="player-nametag">{name}</span>
                </div>
              );
            })}
        </div>

        {/* SELF PLAYER AREA (Bottom Center) */}
        {gameStatus !== 'WAITING' && gameStatus !== 'FINISHED' && (
          <div className="player-self-area">
            {/* Cards */}
            <div className="flex gap-3">
              {myHand.map((card, i) => (
                <div 
                  key={card.id || i} 
                  onClick={() => {
                    if (gameStatus === 'WAITING_FOR_LOSE_CARD' && 
                        useGameStore.getState().pendingAction?.playerToLoseCard === playerName && 
                        !card.revealed) {
                      useGameStore.getState().loseCard(card.id);
                    }
                    if (gameStatus === 'WAITING_FOR_EXCHANGE' &&
                        useGameStore.getState().pendingAction?.playerToLoseCard === playerName &&
                        !card.revealed) {
                      if (selectedCardsToReturn.includes(card.id)) {
                        setSelectedCardsToReturn(prev => prev.filter(id => id !== card.id));
                      } else if (selectedCardsToReturn.length < 1) {
                        setSelectedCardsToReturn(prev => [...prev, card.id]);
                      }
                    }
                  }}
                  className={`self-card ${
                    gameStatus === 'WAITING_FOR_LOSE_CARD' && useGameStore.getState().pendingAction?.playerToLoseCard === playerName && !card.revealed ? 'selectable' : ''
                  } ${
                    gameStatus === 'WAITING_FOR_EXCHANGE' && useGameStore.getState().pendingAction?.playerToLoseCard === playerName && !card.revealed && selectedCardsToReturn.includes(card.id) ? 'selected' : ''
                  } ${
                    card.revealed ? 'grayscale' : ''
                  }`}
                  style={{
                    backgroundImage: `url(${getCardImage(card.role)})`,
                  }}
                >
                  {/* Dark overlay */}
                  {!card.revealed && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)' }} />
                  )}
                  
                  {/* Dead overlay */}
                  {card.revealed && (
                    <div className="card-dead-overlay">
                      <span style={{ fontSize: '32px' }}>💀</span>
                      <span style={{ 
                        color: 'var(--ember-light)', fontWeight: 900, fontSize: '14px', 
                        letterSpacing: '0.1em', border: '3px solid var(--ember)', 
                        padding: '2px 8px', borderRadius: 'var(--radius)',
                        background: 'rgba(0,0,0,.5)',
                        fontFamily: "'Cinzel', serif"
                      }}>DEAD</span>
                    </div>
                  )}
                  
                  {/* Role name */}
                  <div style={{ 
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,.7), transparent)',
                    padding: '20px 8px 8px',
                    textAlign: 'center',
                    zIndex: 5,
                  }}>
                    <span style={{ 
                      fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '12px',
                      color: 'var(--text-on-dark)', textShadow: '0 1px 3px rgba(0,0,0,.8)',
                      letterSpacing: '0.05em'
                    }}>
                      {card.role}
                    </span>
                  </div>
                </div>
              ))}
              
              {myHand.length === 0 && (
                <div style={{ color: 'var(--parchment-aged)', padding: '24px' }}>
                  Loading your hand...
                </div>
              )}
            </div>
            
            {/* Self info bar */}
            <div 
              className="flex items-center gap-3 px-4 py-2"
              style={{
                background: 'linear-gradient(to right, var(--wood), var(--wood-light), var(--wood))',
                border: '2px solid var(--brass)',
                borderRadius: 'var(--radius)',
                boxShadow: '0 4px 12px var(--shadow-warm)',
              }}
            >
              <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: 'var(--gold-light)', fontSize: '13px' }}>
                {playerName}
              </span>
              <span className="coins-badge">🪙 {selfPlayer?.coins ?? 0}</span>
              <span style={{ fontSize: '11px', color: 'var(--parchment-aged)' }}>
                🃏 {myHand.filter(c => !c.revealed).length} cards
              </span>
            </div>
          </div>
        )}

        {/* Self during WAITING */}
        {gameStatus === 'WAITING' && (
          <div className="player-self-area">
            <div className="card-back" style={{ width: '64px', height: '96px' }} />
            <span className="player-nametag" style={{ background: 'linear-gradient(to bottom, var(--forest), #1a4d23)' }}>
              {playerName} (You)
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
