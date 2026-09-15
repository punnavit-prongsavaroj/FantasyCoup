package com.example.coup.dto.request;
import lombok.Data;
import java.util.List;

@Data
public class ReturnCardsRequest {
    private String gameId;
    private String playerName;
    private List<String> cardIds;
}
