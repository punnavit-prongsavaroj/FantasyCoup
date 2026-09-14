package com.example.coup.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class GameStateResponse {
    private String gameId;
    private String status;
    private List<String> players;
}
