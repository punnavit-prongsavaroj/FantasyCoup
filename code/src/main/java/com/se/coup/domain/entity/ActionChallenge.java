package com.se.coup.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "action_challenges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionChallenge extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id")
    private GameAction gameAction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenger_id")
    private GamePlayer challenger;

    private boolean isSuccessful;
}
