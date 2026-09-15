package com.example.coup.controller.api;

import com.example.coup.domain.Card;
import com.example.coup.domain.Game;
import com.example.coup.domain.Player;
import com.example.coup.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/game")
public class PlayerController {

    private final GameService gameService;

    public PlayerController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/{gameId}/player/{playerName}/hand")
    public ResponseEntity<List<Card>> getPlayerHand(@PathVariable String gameId, @PathVariable String playerName) {
        Game game = gameService.getGame(gameId);
        if (game == null) {
            return ResponseEntity.notFound().build();
        }

        Optional<Player> player = game.getPlayerByName(playerName);
        if (player.isPresent()) {
            return ResponseEntity.ok(player.get().getHand());
        }
        
        return ResponseEntity.notFound().build();
    }
}
