package com.example.coup.domain;

import com.example.coup.domain.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Card {
    private String id;
    private Role role;
    private boolean isRevealed;

    public static Card create(Role role) {
        return new Card(UUID.randomUUID().toString(), role, false);
    }
}
