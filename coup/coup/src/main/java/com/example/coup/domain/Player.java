package com.example.coup.domain;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class Player {
    private String name;
    private int coins;
    private List<Card> hand;
    private boolean isAlive;

    public Player(String name) {
        this.name = name;
        this.coins = 2; // Default starting coins
        this.hand = new ArrayList<>();
        this.isAlive = true;
    }

    public void addCard(Card card) {
        this.hand.add(card);
    }
    
    public void loseCoins(int amount) {
        this.coins = Math.max(0, this.coins - amount);
    }
    
    public void addCoins(int amount) {
        this.coins += amount;
    }

    public void checkAliveStatus() {
        // Player is alive if at least one card is not revealed
        this.isAlive = this.hand.stream().anyMatch(card -> !card.isRevealed());
    }
}
