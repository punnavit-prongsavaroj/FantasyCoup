package com.se.coup.domain.entity;

import com.se.coup.domain.enums.CharacterType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "player_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerCard extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_player_id")
    private GamePlayer gamePlayer;

    @Enumerated(EnumType.STRING)
    private CharacterType characterType;

    private boolean isRevealed;
}
