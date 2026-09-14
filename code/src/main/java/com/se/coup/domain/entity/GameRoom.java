package com.se.coup.domain.entity;

import com.se.coup.domain.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "game_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameRoom extends BaseEntity {
    @Column(unique = true, nullable = false)
    private String roomCode;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    private int maxPlayers;
    private Long hostId;
    private Long currentTurnPlayerId;

    @OneToMany(mappedBy = "gameRoom", cascade = CascadeType.ALL)
    private List<GamePlayer> players = new ArrayList<>();
}
