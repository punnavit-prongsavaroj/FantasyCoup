package com.example.coup;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.coup.domain.Game;
import com.example.coup.domain.Player;

public class TestJackson {
    public static void main(String[] args) throws Exception {
        Game game = new Game("TEST");
        game.addPlayer("Alice");
        
        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(game);
        System.out.println("JSON: " + json);
        
        Game deserialized = mapper.readValue(json, Game.class);
        System.out.println("Deserialized players: " + deserialized.getPlayers().size());
        System.out.println("First player hand size: " + deserialized.getPlayers().get(0).getHand().size());
    }
}
