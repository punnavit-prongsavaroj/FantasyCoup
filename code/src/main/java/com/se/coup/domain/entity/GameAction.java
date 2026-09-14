package com.se.coup.domain.entity;

import com.se.coup.domain.enums.ActionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "game_actions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameAction extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private GameRoom gameRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private GamePlayer actor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id")
    private GamePlayer target;

    @Enumerated(EnumType.STRING)
    private ActionType actionType;

    private String status;
}
