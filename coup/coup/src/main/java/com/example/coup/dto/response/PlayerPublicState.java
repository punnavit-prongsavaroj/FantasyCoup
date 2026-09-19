package com.example.coup.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PlayerPublicState {
    private String name;
    private int coins;
    private int cardCount;
    private int totalCards;
    private boolean isAlive;
    private List<String> revealedCards;
}
