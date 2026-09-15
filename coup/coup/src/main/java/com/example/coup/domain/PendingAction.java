package com.example.coup.domain;

import com.example.coup.domain.enums.ActionType;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;

@Data
public class PendingAction {
    private ActionType actionType;
    private String sourcePlayer;
    private String targetPlayer;
    
    // Who is currently claiming a block (if applicable)
    private String blockClaimBy;
    private String blockRoleClaimed;

    // Track players who have passed the current check
    // e.g. "Player2", "Player3"
    private Set<String> passedPlayers = new HashSet<>();
    
    // The player who is forced to lose a card next
    private String playerToLoseCard;

    public PendingAction(ActionType actionType, String sourcePlayer, String targetPlayer) {
        this.actionType = actionType;
        this.sourcePlayer = sourcePlayer;
        this.targetPlayer = targetPlayer;
    }
}
