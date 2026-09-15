package com.example.coup.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlayerPublicState {
    private String name;
    private int coins;
    private int cardCount;
    private boolean isAlive;
    // We can add revealedCards later
}
