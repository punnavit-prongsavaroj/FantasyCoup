package com.example.coup.controller.api;

import com.example.coup.domain.Game;
import com.example.coup.domain.Player;
import com.example.coup.dto.request.JoinGameRequest;
import com.example.coup.dto.response.GameStateResponse;
import com.example.coup.dto.response.PlayerPublicState;
import com.example.coup.service.GameService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class GameWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final GameService gameService;

    public GameWebSocketController(SimpMessagingTemplate messagingTemplate, GameService gameService) {
        this.messagingTemplate = messagingTemplate;
        this.gameService = gameService;
    }

    @MessageMapping("/game.join")
    public void joinGame(@Payload JoinGameRequest request) {
        String gameId = request.getGameId();
        String playerName = request.getPlayerName();

        gameService.joinGame(gameId, playerName);
        broadcastGameState(gameId);
    }

    @MessageMapping("/game.start")
    public void startGame(@Payload JoinGameRequest request) { 
        String gameId = request.getGameId();
        gameService.startGame(gameId);
        broadcastGameState(gameId);
    }

    @MessageMapping("/game.leave")
    public void leaveGame(@Payload JoinGameRequest request) {
        String gameId = request.getGameId();
        String playerName = request.getPlayerName();
        gameService.leaveGame(gameId, playerName);
        broadcastGameState(gameId);
    }

    @MessageMapping("/game.action")
    public void takeAction(@Payload com.example.coup.dto.request.ActionRequest request) {
        String gameId = request.getGameId();
        gameService.handleAction(gameId, request.getPlayerName(), request.getActionType(), request.getTargetPlayerName());
        broadcastGameState(gameId);
    }

    @MessageMapping("/game.react")
    public void reactToAction(@Payload com.example.coup.dto.request.ReactionRequest request) {
        String gameId = request.getGameId();
        gameService.handleReaction(gameId, request.getPlayerName(), request.getReactionType(), request.getRoleClaimed());
        broadcastGameState(gameId);
    }

    @MessageMapping("/game.loseCard")
    public void loseCard(@Payload com.example.coup.dto.request.LoseCardRequest request) {
        String gameId = request.getGameId();
        gameService.loseCard(gameId, request.getPlayerName(), request.getCardId());
        broadcastGameState(gameId);
    }

    @MessageMapping("/game.returnCards")
    public void returnCards(@Payload com.example.coup.dto.request.ReturnCardsRequest request) {
        String gameId = request.getGameId();
        gameService.returnCards(gameId, request.getPlayerName(), request.getCardIds());
        broadcastGameState(gameId);
    }

    private void broadcastGameState(String gameId) {
        Game game = gameService.getGame(gameId);
        if (game == null) return;

        List<PlayerPublicState> playerStates = game.getPlayers().stream()
            .map(p -> PlayerPublicState.builder()
                .name(p.getName())
                .coins(p.getCoins())
                .cardCount((int) p.getHand().stream().filter(c -> !c.isRevealed()).count())
                .totalCards(p.getHand().size())
                .isAlive(p.isAlive())
                .revealedCards(p.getHand().stream()
                    .filter(com.example.coup.domain.Card::isRevealed)
                    .map(c -> c.getRole().name())
                    .collect(Collectors.toList()))
                .build())
            .collect(Collectors.toList());

        GameStateResponse response = GameStateResponse.builder()
                .gameId(game.getGameId())
                .status(game.getStatus())
                .players(game.getPlayers().stream().map(Player::getName).collect(Collectors.toList()))
                .playersState(playerStates)
                .currentTurnPlayer(game.getCurrentPlayer() != null ? game.getCurrentPlayer().getName() : null)
                .winnerName(game.getWinnerName())
                .pendingAction(game.getPendingAction())
                .build();

        messagingTemplate.convertAndSend("/topic/game/" + gameId, response);
    }
}
