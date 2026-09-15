import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import type { PlayerPublicState } from '../store/gameStore';

// Helper to get nice colors for roles
const getRoleColor = (role: string) => {
  switch(role) {
    case 'KING': return 'bg-purple-600 border-purple-400';
    case 'HERO': return 'bg-blue-600 border-blue-400';
    case 'ASSASSIN': return 'bg-red-800 border-red-500';
    case 'HOLY_MAIDEN': return 'bg-pink-600 border-pink-400';
    case 'MERCHANT': return 'bg-green-600 border-green-400';
    default: return 'bg-gray-700 border-gray-500';
  }
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
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (connected && gameId && players.length === 0) {
       joinGame(gameId);
    }
  }, [connected, gameId, joinGame, players.length]);

  // Handle Background Music
  useEffect(() => {
    const audio = new Audio('/sounds/bgm.wav');
    audio.loop = true;
    audio.volume = 0.25; // 25% volume for BGM
    bgmRef.current = audio;
    
    // Try to auto-play (browsers often block this until user interacts)
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

  if (!connected) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Reconnecting to game...</div>;
  }

  return (
    <div className="min-h-screen p-6 flex flex-col bg-gray-900 text-white font-sans">
      <header className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-indigo-400">Room: {gameId}</h2>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${gameStatus === 'IN_PROGRESS' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
            Status: {gameStatus}
          </p>
        </div>
        
        {gameStatus === 'IN_PROGRESS' && (
          <div className="px-6 py-2 bg-indigo-900/50 border border-indigo-500 rounded-lg text-center">
            <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Current Turn</p>
            <p className="font-bold text-lg text-white">{currentTurnPlayer === playerName ? 'YOUR TURN' : currentTurnPlayer}</p>
          </div>
        )}

        <div className="flex gap-4 items-center">
          <div className="text-right">
            <p className="text-sm text-gray-400">Playing as</p>
            <p className="font-bold text-green-400">{playerName}</p>
          </div>
          
          <button 
            onClick={toggleMute}
            className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg transition shadow-sm"
            title={isMuted ? "Unmute Music" : "Mute Music"}
          >
            {isMuted ? '🔇' : '🎵'}
          </button>

          <button 
            onClick={() => {
              leaveGame();
              navigate('/lobby');
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-red-600/80 rounded-lg text-sm font-medium transition shadow-sm"
          >
            Leave
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
            {playersState.length > 0 ? (
              // Show detailed state if game started or lobby synced
              playersState.map((player: PlayerPublicState, index) => (
                <li key={index} className={`flex flex-col p-3 rounded-lg border ${
                    currentTurnPlayer === player.name ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' :
                    player.name === playerName ? 'bg-gray-700/80 border-gray-500' : 'bg-gray-800 border-gray-700'
                  } ${!player.alive && 'opacity-50'}`}>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold ${player.name === playerName ? 'text-green-400' : 'text-gray-200'}`}>
                      {player.name} {player.name === playerName && '(You)'}
                    </span>
                    {!player.alive && <span className="text-xs text-red-400 font-bold uppercase">Dead</span>}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                      {player.coins} Coins
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-4 bg-blue-300 rounded-sm inline-block"></span>
                      {player.cardCount} Cards
                    </span>
                  </div>
                </li>
              ))
            ) : (
              // Show basic list before syncing
              players.map((player, index) => (
                <li key={index} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 text-gray-200">
                  {player} {player === playerName && '(You)'}
                </li>
              ))
            )}
            
            {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
              <li key={`empty-${i}`} className="p-3 border border-dashed border-gray-700 rounded-lg text-gray-600 text-sm text-center">
                Empty Slot
              </li>
            ))}
          </ul>
        </aside>

        {/* Game Board Area */}
        <section className="flex-1 bg-gray-800/40 rounded-xl border border-gray-700 p-6 flex flex-col relative shadow-inner">
          
          {gameStatus === 'WAITING' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h1 className="text-4xl font-bold mb-4 text-gray-200">Waiting Room</h1>
              {players.length >= 2 ? (
                <button 
                  onClick={startGame}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xl transition shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105"
                >
                  Start Game
                </button>
              ) : (
                <p className="text-gray-400 bg-gray-800 p-4 rounded-lg border border-gray-700">
                  Need at least 2 players to start...
                </p>
              )}
            </div>
          )}

          {gameStatus === 'FINISHED' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h1 className="text-6xl font-black mb-4 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">GAME OVER</h1>
              <p className="text-3xl text-white mb-8">
                Winner: <span className="font-bold text-green-400">{useGameStore.getState().winnerName}</span>
              </p>
              <button 
                onClick={() => {
                  leaveGame();
                  navigate('/lobby');
                }}
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xl transition shadow-lg"
              >
                Back to Lobby
              </button>
            </div>
          )}

          {gameStatus === 'ACTION_PENDING' && useGameStore.getState().pendingAction && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="bg-gray-800/80 p-8 rounded-2xl border-2 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)] max-w-2xl w-full">
                <h2 className="text-3xl font-black mb-4 text-yellow-400">Action Declared</h2>
                <p className="text-xl text-white mb-8">
                  <span className="font-bold text-green-400">{useGameStore.getState().pendingAction?.sourcePlayer}</span> is using 
                  <span className="font-bold text-indigo-400 mx-2">{useGameStore.getState().pendingAction?.actionType}</span>
                  {useGameStore.getState().pendingAction?.targetPlayer && (
                    <>on <span className="font-bold text-red-400">{useGameStore.getState().pendingAction?.targetPlayer}</span></>
                  )}
                </p>

                {playerName === useGameStore.getState().pendingAction?.sourcePlayer ? (
                  <p className="text-gray-400 animate-pulse">Waiting for others to respond...</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {!blocking ? (
                      <div className="flex gap-4 justify-center">
                        <button 
                          onClick={() => useGameStore.getState().reactToAction('PASS')}
                          className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-bold transition"
                        >Pass</button>
                        
                        <button 
                          onClick={() => useGameStore.getState().reactToAction('CHALLENGE')}
                          className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition"
                        >Challenge (Liar!)</button>
                        
                        {['FOREIGN_AID', 'ASSASSINATE', 'STEAL'].includes(useGameStore.getState().pendingAction?.actionType || '') && (
                          <button 
                            onClick={() => setBlocking(true)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition"
                          >Block</button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <p className="text-blue-300 mb-2 font-bold">Select role to block with:</p>
                        <div className="flex gap-3 justify-center flex-wrap">
                          {useGameStore.getState().pendingAction?.actionType === 'FOREIGN_AID' && (
                            <button onClick={() => { setBlocking(false); useGameStore.getState().reactToAction('BLOCK', 'KING'); }} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 font-bold rounded-lg transition">👑 King</button>
                          )}
                          {useGameStore.getState().pendingAction?.actionType === 'ASSASSINATE' && (
                            <button onClick={() => { setBlocking(false); useGameStore.getState().reactToAction('BLOCK', 'HOLY_MAIDEN'); }} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 font-bold rounded-lg transition">🛡️ Holy Maiden</button>
                          )}
                          {useGameStore.getState().pendingAction?.actionType === 'STEAL' && (
                            <>
                              <button onClick={() => { setBlocking(false); useGameStore.getState().reactToAction('BLOCK', 'HERO'); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold rounded-lg transition">🗡️ Hero (ผู้กล้า)</button>
                              <button onClick={() => { setBlocking(false); useGameStore.getState().reactToAction('BLOCK', 'MERCHANT'); }} className="px-4 py-2 bg-green-600 hover:bg-green-500 font-bold rounded-lg transition">📜 Merchant</button>
                            </>
                          )}
                          <button onClick={() => setBlocking(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {gameStatus === 'BLOCK_PENDING' && useGameStore.getState().pendingAction && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="bg-gray-800/80 p-8 rounded-2xl border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] max-w-2xl w-full">
                <h2 className="text-3xl font-black mb-4 text-blue-400">Block Declared</h2>
                <p className="text-xl text-white mb-8">
                  <span className="font-bold text-green-400">{useGameStore.getState().pendingAction?.blockClaimBy}</span> blocked with 
                  <span className="font-bold text-indigo-400 mx-2">{useGameStore.getState().pendingAction?.blockRoleClaimed}</span>
                </p>

                {playerName === useGameStore.getState().pendingAction?.blockClaimBy ? (
                  <p className="text-gray-400 animate-pulse">Waiting for others to respond to your block...</p>
                ) : (
                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => useGameStore.getState().reactToAction('PASS')}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-bold transition"
                    >Pass (Allow Block)</button>
                    
                    <button 
                      onClick={() => useGameStore.getState().reactToAction('CHALLENGE')}
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition"
                    >Challenge (Liar!)</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {gameStatus === 'WAITING_FOR_LOSE_CARD' && useGameStore.getState().pendingAction && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="bg-gray-800/80 p-8 rounded-2xl border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)] max-w-2xl w-full">
                <h2 className="text-3xl font-black mb-4 text-red-500">Lose a Card</h2>
                <p className="text-xl text-white mb-8">
                  <span className="font-bold text-green-400">{useGameStore.getState().pendingAction?.playerToLoseCard}</span> must choose a card to discard.
                </p>
                
                {playerName === useGameStore.getState().pendingAction?.playerToLoseCard ? (
                  <p className="text-yellow-400 font-bold animate-pulse">Select a card from your hand below to discard!</p>
                ) : (
                  <p className="text-gray-400 animate-pulse">Waiting for them to choose...</p>
                )}
              </div>
            </div>
          )}

          {gameStatus === 'IN_PROGRESS' && (
            <div className="flex-1 flex flex-col items-center justify-center mb-48">
              {currentTurnPlayer === playerName ? (
                <div className="bg-gray-800/80 p-8 rounded-2xl border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)] text-center w-full max-w-2xl">
                  <h2 className="text-3xl font-black mb-6 text-white tracking-widest uppercase">Your Turn</h2>
                  <p className="text-gray-400 mb-6">Choose an action to perform</p>
                  
                  {!targetAction ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Basic Actions */}
                      <button 
                        onClick={() => useGameStore.getState().takeAction('INCOME')}
                        className="p-3 bg-gray-700 hover:bg-gray-600 border border-gray-500 rounded-xl transition flex flex-col items-center justify-center gap-1 group"
                      >
                        <span className="text-xl">🪙</span>
                        <span className="font-bold text-gray-200 group-hover:text-white text-sm">Income</span>
                        <span className="text-xs text-green-400">+1 Coin</span>
                      </button>
                      
                      <button 
                        onClick={() => useGameStore.getState().takeAction('FOREIGN_AID')}
                        className="p-3 bg-gray-700 hover:bg-gray-600 border border-gray-500 rounded-xl transition flex flex-col items-center justify-center gap-1 group"
                      >
                        <span className="text-xl">💰</span>
                        <span className="font-bold text-gray-200 group-hover:text-white text-sm">Foreign Aid</span>
                        <span className="text-xs text-green-400">+2 Coins</span>
                      </button>

                      <button 
                        onClick={() => setTargetAction('COUP')}
                        className="p-3 bg-red-900/40 hover:bg-red-800/60 border border-red-500/50 rounded-xl transition flex flex-col items-center justify-center gap-1 group"
                      >
                        <span className="text-xl">⚔️</span>
                        <span className="font-bold text-red-200 group-hover:text-white text-sm">Coup</span>
                        <span className="text-xs text-red-400">-7 Coins (Kill 1)</span>
                      </button>

                      {/* Character Actions */}
                      <button 
                        onClick={() => useGameStore.getState().takeAction('TAX')}
                        className="p-3 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/50 rounded-xl transition flex flex-col items-center justify-center gap-1 group"
                      >
                        <span className="text-xl">👑</span>
                        <span className="font-bold text-purple-200 group-hover:text-white text-sm">Tax (King)</span>
                        <span className="text-xs text-green-400">+3 Coins</span>
                      </button>

                      <button 
                        onClick={() => setTargetAction('ASSASSINATE')}
                        className="p-3 bg-red-900/40 hover:bg-red-800/60 border border-red-500/50 rounded-xl transition flex flex-col items-center justify-center gap-1 group"
                      >
                        <span className="text-xl">🗡️</span>
                        <span className="font-bold text-red-200 group-hover:text-white text-sm">Assassinate</span>
                        <span className="text-xs text-red-400">-3 Coins</span>
                      </button>

                      <button 
                        onClick={() => setTargetAction('STEAL')}
                        className="p-3 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/50 rounded-xl transition flex flex-col items-center justify-center gap-1 group"
                      >
                        <span className="text-xl">🗡️</span>
                        <span className="font-bold text-blue-200 group-hover:text-white text-sm">Steal (Hero)</span>
                        <span className="text-xs text-green-400">+2 Coins from Target</span>
                      </button>

                      <button 
                        onClick={() => useGameStore.getState().takeAction('EXCHANGE')}
                        className="p-3 bg-green-900/40 hover:bg-green-800/60 border border-green-500/50 rounded-xl transition flex flex-col items-center justify-center gap-1 group md:col-start-2"
                      >
                        <span className="text-xl">📜</span>
                        <span className="font-bold text-green-200 group-hover:text-white text-sm">Exchange</span>
                        <span className="text-xs text-green-400">Swap Cards</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
                      <p className="text-xl text-yellow-400 font-bold">Select target for {targetAction}:</p>
                      <div className="flex flex-wrap justify-center gap-4">
                        {playersState
                          .filter(p => p.alive && p.name !== playerName)
                          .map(p => (
                            <button 
                              key={p.name}
                              onClick={() => {
                                useGameStore.getState().takeAction(targetAction, p.name);
                                setTargetAction(null);
                              }}
                              className="px-6 py-3 bg-gray-700 hover:bg-red-900 border border-gray-500 hover:border-red-500 rounded-xl font-bold transition flex items-center gap-2"
                            >
                              🎯 {p.name}
                            </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setTargetAction(null)}
                        className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg mx-auto w-32"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center opacity-50">
                  <h1 className="text-5xl font-bold mb-4 text-gray-400">Waiting for {currentTurnPlayer}</h1>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Player's Cards Area (Bottom Right) - Always visible during the game */}
          {gameStatus !== 'WAITING' && gameStatus !== 'FINISHED' && (
            <div className="absolute bottom-6 right-6 flex flex-col items-end group z-50">
              <div className="flex gap-4 mb-2 origin-bottom-right scale-75 opacity-80 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-hover:-translate-y-2 group-hover:-translate-x-2 cursor-pointer">
                {myHand.map((card, i) => (
                  <div 
                    key={card.id || i} 
                    onClick={() => {
                      if (gameStatus === 'WAITING_FOR_LOSE_CARD' && 
                          useGameStore.getState().pendingAction?.playerToLoseCard === playerName && 
                          !card.revealed) {
                        useGameStore.getState().loseCard(card.id);
                      }
                    }}
                    style={{
                      backgroundImage: card.revealed ? 'none' : `url(/cards/${card.role.toLowerCase()}.jpg)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    className={`w-36 h-56 rounded-xl flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group border-2 transition-transform hover:-translate-y-2
                      ${card.revealed ? 'bg-gray-800 border-red-800 grayscale' : getRoleColor(card.role)}
                      ${gameStatus === 'WAITING_FOR_LOSE_CARD' && useGameStore.getState().pendingAction?.playerToLoseCard === playerName && !card.revealed ? 'cursor-pointer border-red-500 animate-pulse hover:scale-110' : 'cursor-default'}`}
                  >
                    {/* Dark overlay to make text readable if image is bright */}
                    {!card.revealed && <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>}
                    
                    {card.revealed && (
                      <div className="absolute inset-0 bg-red-900/40 z-10 flex items-center justify-center">
                        <span className="text-red-500 font-bold text-2xl -rotate-45 border-4 border-red-500 p-2 rounded">DEAD</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2 text-white/50 text-xs font-bold">{card.role}</div>
                    
                    <h3 className="relative z-10 font-black text-xl text-white tracking-widest drop-shadow-md">
                      {card.role}
                    </h3>
                    
                    {/* Decorative patterns */}
                    <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                ))}
                
                {myHand.length === 0 && (
                  <div className="text-gray-500 flex items-center justify-center h-24">
                    Loading your hand...
                  </div>
                )}
              </div>
              <div className="bg-gray-800 px-6 py-2 rounded-full border border-gray-700 font-medium text-gray-300">
                Your Cards (Do not show anyone)
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
