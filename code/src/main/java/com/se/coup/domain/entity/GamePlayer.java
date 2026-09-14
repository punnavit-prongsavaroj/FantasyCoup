package com.se.coup.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "game_players")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GamePlayer extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private GameRoom gameRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private int coins;
    private boolean isAlive;
    private int turnOrder;

    @OneToMany(mappedBy = "gamePlayer", cascade = CascadeType.ALL)
    private List<PlayerCard> cards = new ArrayList<>();
}
