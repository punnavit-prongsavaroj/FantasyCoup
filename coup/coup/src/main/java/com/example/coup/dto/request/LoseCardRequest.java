package com.example.coup.dto.request;

import lombok.Data;

@Data
public class LoseCardRequest {
    private String gameId;
    private String playerName;
    private String cardId;
}
