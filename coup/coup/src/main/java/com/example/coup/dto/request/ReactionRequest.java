package com.example.coup.dto.request;

import com.example.coup.domain.enums.ReactionType;
import lombok.Data;

@Data
public class ReactionRequest {
    private String gameId;
    private String playerName;
    private ReactionType reactionType;
    private String roleClaimed;
}
