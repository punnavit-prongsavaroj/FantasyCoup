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

        // Basic Actions implementation (MVP: No challenge/block phase yet)
        switch (actionType) {
            case INCOME:
                player.addCoins(1);
                game.nextTurn();
                break;
            case FOREIGN_AID:
                player.addCoins(2);
                game.nextTurn();
                break;
            case TAX:
                player.addCoins(3);
                game.nextTurn();
                break;
            case STEAL:
                com.example.coup.domain.Player stealTarget = game.getPlayers().stream().filter(p -> p.getName().equals(targetName)).findFirst().orElse(null);
                if (stealTarget != null && stealTarget.isAlive()) {
                    int stolen = Math.min(2, stealTarget.getCoins());
                    stealTarget.loseCoins(stolen);
                    player.addCoins(stolen);
                }
                game.nextTurn();
                break;
            case COUP:
                if (player.getCoins() >= 7) {
                    player.loseCoins(7);
                    com.example.coup.domain.Player coupTarget = game.getPlayers().stream().filter(p -> p.getName().equals(targetName)).findFirst().orElse(null);
                    if (coupTarget != null && coupTarget.isAlive()) {
                        // Auto-kill first unrevealed card for MVP
                        coupTarget.getHand().stream().filter(c -> !c.isRevealed()).findFirst().ifPresent(c -> c.setRevealed(true));
                        coupTarget.checkAliveStatus();
                    }
                }
                game.nextTurn();
                break;
            case ASSASSINATE:
                if (player.getCoins() >= 3) {
                    player.loseCoins(3);
                    com.example.coup.domain.Player assTarget = game.getPlayers().stream().filter(p -> p.getName().equals(targetName)).findFirst().orElse(null);
                    if (assTarget != null && assTarget.isAlive()) {
                        assTarget.getHand().stream().filter(c -> !c.isRevealed()).findFirst().ifPresent(c -> c.setRevealed(true));
                        assTarget.checkAliveStatus();
                    }
                }
                game.nextTurn();
                break;
            case EXCHANGE:
                // Needs complex UI, skip for now MVP
                game.nextTurn();
                break;
            default:
                break;
        }
    }
}
