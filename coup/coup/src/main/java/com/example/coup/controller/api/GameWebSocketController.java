package com.example.coup.controller.api;

import com.example.coup.dto.request.JoinGameRequest;
import com.example.coup.dto.response.GameStateResponse;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class GameWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    
    // In-memory store for mockup. In production, use GameService & Database
    private final Map<String, List<String>> gameRooms = new HashMap<>();

    public GameWebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/game.join")
    public void joinGame(@Payload JoinGameRequest request) {
        String gameId = request.getGameId();
        String playerName = request.getPlayerName();

        gameRooms.putIfAbsent(gameId, new ArrayList<>());
        
        List<String> players = gameRooms.get(gameId);
        if (!players.contains(playerName)) {
            players.add(playerName);
        }

        GameStateResponse response = GameStateResponse.builder()
                .gameId(gameId)
                .status("WAITING")
                .players(players)
                .build();

        // Broadcast to all subscribers of this game room
        messagingTemplate.convertAndSend("/topic/game/" + gameId, response);
    }
}
