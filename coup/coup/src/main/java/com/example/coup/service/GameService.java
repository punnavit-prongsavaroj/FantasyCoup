package com.example.coup.service;

import com.example.coup.domain.Game;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class GameService {
    
    // In-memory DB for games
    private final Map<String, Game> games = new HashMap<>();

    public Game getOrCreateGame(String gameId) {
        return games.computeIfAbsent(gameId, Game::new);
    }

    public Game getGame(String gameId) {
        return games.get(gameId);
    }

    public void joinGame(String gameId, String playerName) {
        Game game = getOrCreateGame(gameId);
        game.addPlayer(playerName);
    }

    public void startGame(String gameId) {
        Game game = getGame(gameId);
        if (game != null && game.getStatus().equals("WAITING")) {
            game.startGame();
        }
    }

    public void handleAction(String gameId, String playerName, com.example.coup.domain.enums.ActionType actionType, String targetName) {
        Game game = getGame(gameId);
        if (game == null || !game.getStatus().equals("IN_PROGRESS")) return;

        // Check if it's this player's turn
        if (!game.getCurrentPlayer().getName().equals(playerName)) return;

        com.example.coup.domain.Player player = game.getCurrentPlayer();

        if (actionType == com.example.coup.domain.enums.ActionType.INCOME) {
            player.addCoins(1);
            game.nextTurn();
            return;
        }

        if (actionType == com.example.coup.domain.enums.ActionType.COUP) {
            if (player.getCoins() >= 7) {
                player.loseCoins(7);
                game.setPendingAction(new com.example.coup.domain.PendingAction(actionType, playerName, targetName));
                game.getPendingAction().setPlayerToLoseCard(targetName);
                game.setStatus("WAITING_FOR_LOSE_CARD");
            }
            return;
        }
        
        // For other actions, enter ACTION_PENDING
        // Pay cost upfront
        if (actionType == com.example.coup.domain.enums.ActionType.ASSASSINATE) {
            if (player.getCoins() < 3) return;
            player.loseCoins(3);
        }

        game.setPendingAction(new com.example.coup.domain.PendingAction(actionType, playerName, targetName));
        game.setStatus("ACTION_PENDING");
    }

    public void handleReaction(String gameId, String playerName, com.example.coup.domain.enums.ReactionType reactionType, String roleClaimed) {
        Game game = getGame(gameId);
        if (game == null || game.getPendingAction() == null) return;
        
        com.example.coup.domain.PendingAction action = game.getPendingAction();
        
        if (reactionType == com.example.coup.domain.enums.ReactionType.PASS) {
            action.getPassedPlayers().add(playerName);
            long alivePlayers = game.getPlayers().stream().filter(com.example.coup.domain.Player::isAlive).count();
            // If everyone else passed
            if (action.getPassedPlayers().size() >= alivePlayers - 1) {
                if (game.getStatus().equals("BLOCK_PENDING")) {
                    // Everyone passed the block -> block succeeds! action fails.
                    game.setStatus("IN_PROGRESS");
                    game.setPendingAction(null);
                    game.nextTurn();
                } else {
                    // Everyone passed the action -> action resolves
                    resolveAction(game, true);
                }
            }
        } else if (reactionType == com.example.coup.domain.enums.ReactionType.BLOCK) {
            // Player declares a block
            action.setBlockClaimBy(playerName);
            action.setBlockRoleClaimed(roleClaimed);
            action.getPassedPlayers().clear();
            game.setStatus("BLOCK_PENDING");
        } else if (reactionType == com.example.coup.domain.enums.ReactionType.CHALLENGE) {
            if (game.getStatus().equals("ACTION_PENDING")) {
                com.example.coup.domain.Player source = game.getPlayerByName(action.getSourcePlayer()).orElse(null);
                String requiredRole = getRequiredRoleForAction(action.getActionType());
                
                if (source != null && requiredRole != null) {
                    boolean hasRole = source.getHand().stream().anyMatch(c -> !c.isRevealed() && c.getRole().name().equals(requiredRole));
                    if (hasRole) {
                        // Challenger loses
                        action.setPlayerToLoseCard(playerName);
                        game.setStatus("WAITING_FOR_LOSE_CARD");
                        // We also need to resolve the action. If action also requires losing a card (e.g. Assassinate), 
                        // we'd need a queue. For MVP, we will only resolve non-card-loss actions here.
                        if (action.getActionType() != com.example.coup.domain.enums.ActionType.ASSASSINATE && 
                            action.getActionType() != com.example.coup.domain.enums.ActionType.COUP) {
                            resolveAction(game, false); // false = don't change state/turn
                        }
                    } else {
                        // Source loses
                        action.setPlayerToLoseCard(source.getName());
                        game.setStatus("WAITING_FOR_LOSE_CARD");
                        // Action fails, no resolveAction call. It will just nextTurn after discard.
                    }
                }
            } else if (game.getStatus().equals("BLOCK_PENDING")) {
                com.example.coup.domain.Player blocker = game.getPlayerByName(action.getBlockClaimBy()).orElse(null);
                if (blocker != null && action.getBlockRoleClaimed() != null) {
                    boolean hasRole = blocker.getHand().stream().anyMatch(c -> !c.isRevealed() && c.getRole().name().equals(action.getBlockRoleClaimed()));
                    if (hasRole) {
                        // Challenger loses
                        action.setPlayerToLoseCard(playerName);
                        game.setStatus("WAITING_FOR_LOSE_CARD");
                        // Action is successfully blocked, so it fails. nextTurn after discard.
                    } else {
                        // Blocker was lying! Blocker loses
                        action.setPlayerToLoseCard(blocker.getName());
                        game.setStatus("WAITING_FOR_LOSE_CARD");
                        // Block fails -> Action proceeds!
                        resolveAction(game, false);
                    }
                }
            }
        }
    }

    private String getRequiredRoleForAction(com.example.coup.domain.enums.ActionType actionType) {
        switch(actionType) {
            case TAX: return "KING";
            case STEAL: return "ADVENTURER"; // Also MERCHANT, but simplify for now
            case ASSASSINATE: return "ASSASSIN";
            case EXCHANGE: return "MERCHANT";
            default: return null;
        }
    }

    private void resolveAction(Game game, boolean endTurn) {
        com.example.coup.domain.PendingAction action = game.getPendingAction();
        com.example.coup.domain.Player source = game.getPlayerByName(action.getSourcePlayer()).orElse(null);
        com.example.coup.domain.Player target = action.getTargetPlayer() != null ? game.getPlayerByName(action.getTargetPlayer()).orElse(null) : null;
        
        if (source != null) {
            switch (action.getActionType()) {
                case FOREIGN_AID:
                    source.addCoins(2);
                    if (endTurn) {
                        game.setStatus("IN_PROGRESS");
                        game.setPendingAction(null);
                        game.nextTurn();
                    }
                    break;
                case TAX:
                    source.addCoins(3);
                    if (endTurn) {
                        game.setStatus("IN_PROGRESS");
                        game.setPendingAction(null);
                        game.nextTurn();
                    }
                    break;
                case STEAL:
                    if (target != null) {
                        int stolen = Math.min(2, target.getCoins());
                        target.loseCoins(stolen);
                        source.addCoins(stolen);
                    }
                    if (endTurn) {
                        game.setStatus("IN_PROGRESS");
                        game.setPendingAction(null);
                        game.nextTurn();
                    }
                    break;
                case ASSASSINATE:
                    if (target != null) {
                        action.setPlayerToLoseCard(target.getName());
                        game.setStatus("WAITING_FOR_LOSE_CARD");
                    } else {
                        if (endTurn) {
                            game.setStatus("IN_PROGRESS");
                            game.setPendingAction(null);
                            game.nextTurn();
                        }
                    }
                    break;
                default:
                    if (endTurn) {
                        game.setStatus("IN_PROGRESS");
                        game.setPendingAction(null);
                        game.nextTurn();
                    }
                    break;
            }
        }
    }
    
    public void loseCard(String gameId, String playerName, String cardId) {
        Game game = getGame(gameId);
        if (game == null || !game.getStatus().equals("WAITING_FOR_LOSE_CARD")) return;
        
        if (game.getPendingAction() != null && game.getPendingAction().getPlayerToLoseCard().equals(playerName)) {
            com.example.coup.domain.Player p = game.getPlayerByName(playerName).orElse(null);
            if (p != null) {
                p.getHand().stream().filter(c -> c.getId().equals(cardId)).findFirst().ifPresent(c -> c.setRevealed(true));
                p.checkAliveStatus();
                game.setPendingAction(null);
                game.setStatus("IN_PROGRESS");
                game.nextTurn();
            }
        }
    }
}
