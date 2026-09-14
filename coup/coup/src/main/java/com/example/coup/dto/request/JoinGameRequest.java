package com.example.coup.dto.request;

import lombok.Data;

@Data
public class JoinGameRequest {
    private String gameId;
    private String playerName;
}
