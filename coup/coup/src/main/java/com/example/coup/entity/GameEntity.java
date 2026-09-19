package com.example.coup.entity;

import com.example.coup.domain.Game;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@Entity
@Table(name = "games")
public class GameEntity {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "game_state", columnDefinition = "jsonb")
    private Game gameState;
}
