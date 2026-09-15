package com.example.coup.domain;

import com.example.coup.domain.enums.ActionType;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GameAction {
    private String sourcePlayerName;
    private ActionType actionType;
    private String targetPlayerName; // สำหรับแอคชั่นที่มีเป้าหมาย (เช่น COUP, ASSASSINATE, STEAL)
    private String status; // PENDING (รอคนบล็อก/จับโกหก), BLOCKED, CHALLENGED, RESOLVED

    public GameAction(String sourcePlayerName, ActionType actionType) {
        this.sourcePlayerName = sourcePlayerName;
        this.actionType = actionType;
        this.status = "PENDING";
    }

    public GameAction(String sourcePlayerName, ActionType actionType, String targetPlayerName) {
        this.sourcePlayerName = sourcePlayerName;
        this.actionType = actionType;
        this.targetPlayerName = targetPlayerName;
        this.status = "PENDING";
    }
}
