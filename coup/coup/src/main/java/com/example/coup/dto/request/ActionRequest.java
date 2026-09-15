package com.example.coup.dto.request;

import com.example.coup.domain.enums.ActionType;
import lombok.Data;

@Data
public class ActionRequest {
    private String gameId;
    private String playerName;
    private ActionType actionType;
    private String targetPlayerName;
}
