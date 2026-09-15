package com.example.coup.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class GameStateResponse {
    private String gameId;
    private String status;
    private List<String> players; // Just names for Lobby
    private List<PlayerPublicState> playersState; // Full public state for Game Board
    private String currentTurnPlayer;
    private String winnerName;
    private com.example.coup.domain.PendingAction pendingAction;
}
