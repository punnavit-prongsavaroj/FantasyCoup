package com.example.coup.domain;

import com.example.coup.domain.enums.Role;
import lombok.Data;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Data
public class Game {
    private String gameId;
    private List<Player> players;
    private List<Card> deck;
    private String status; // WAITING, IN_PROGRESS, FINISHED
    private int currentTurnIndex;
    private String winnerName;

    public Game(String gameId) {
        this.gameId = gameId;
        this.players = new ArrayList<>();
        this.deck = new ArrayList<>();
        this.status = "WAITING";
        this.currentTurnIndex = 0;
    }

    public void addPlayer(String playerName) {
        if (status.equals("WAITING") && players.size() < 6 && getPlayerByName(playerName).isEmpty()) {
            players.add(new Player(playerName));
        }
    }

    public Optional<Player> getPlayerByName(String name) {
        return players.stream().filter(p -> p.getName().equals(name)).findFirst();
    }

    public void initializeDeck() {
        this.deck.clear();
        for (int i = 0; i < 3; i++) {
            deck.add(Card.create(Role.KING));
            deck.add(Card.create(Role.ADVENTURER));
            deck.add(Card.create(Role.ASSASSIN));
            deck.add(Card.create(Role.HOLY_MAIDEN));
            deck.add(Card.create(Role.MERCHANT));
        }
        Collections.shuffle(this.deck);
    }

    public void startGame() {
        if (players.size() < 2) return;
        
        initializeDeck();
        
        // Deal 2 cards to each player
        for (Player player : players) {
            player.getHand().clear();
            player.setCoins(2);
            player.addCard(deck.remove(deck.size() - 1));
            player.addCard(deck.remove(deck.size() - 1));
        }
        
        this.status = "IN_PROGRESS";
        this.currentTurnIndex = (int) (Math.random() * players.size());
    }

    public Player getCurrentPlayer() {
        if (players.isEmpty()) return null;
        return players.get(currentTurnIndex);
    }

    public void nextTurn() {
        do {
            currentTurnIndex = (currentTurnIndex + 1) % players.size();
        } while (!players.get(currentTurnIndex).isAlive());
    }
}
