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
}
