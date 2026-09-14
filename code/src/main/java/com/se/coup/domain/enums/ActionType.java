package com.se.coup.domain.enums;

import lombok.Getter;

@Getter
public enum ActionType {
    // Basic Actions (ใครก็ทำได้)
    HIRED_LABOR("แรงงานรับจ้าง", 1, false, false, null), // Income (รับ 1 เหรียญ)
    PROVINCIAL_TRIBUTE("ส่วยจากหัวเมือง", 2, false, true, null), // Foreign Aid (รับ 2 เหรียญ, ราชาบล็อกได้)
    CASTLE_SIEGE("บุกปราสาท", -7, false, false, null), // Coup (จ่าย 7 เหรียญ สังหาร 1 อิทธิพล)

    // Character Actions (ต้องอ้างตัวละคร)
    ROYAL_TAX("เก็บภาษีหลวง", 3, true, false, CharacterType.KING), // Duke's Tax
    STEAL_TREASURE("ชิงสมบัติ", 2, true, true, CharacterType.ADVENTURER), // Captain's Steal (เป้าหมายสามารถบล็อกด้วยนักผจญภัยหรือพ่อค้า)
    ASSASSINATE("ลอบสังหาร", -3, true, true, CharacterType.ASSASSIN), // Assassin's action (เป้าหมายสามารถบล็อกด้วยสตรีศักดิ์สิทธิ์)
    TRADE("ค้าขาย", 0, true, false, CharacterType.MERCHANT); // Ambassador's exchange

    private final String thName;
    private final int coinEffect;
    private final boolean canBeChallenged;
    private final boolean canBeBlocked;
    private final CharacterType requiredCharacter; // null if it's a basic action

    ActionType(String thName, int coinEffect, boolean canBeChallenged, boolean canBeBlocked, CharacterType requiredCharacter) {
        this.thName = thName;
        this.coinEffect = coinEffect;
        this.canBeChallenged = canBeChallenged;
        this.canBeBlocked = canBeBlocked;
        this.requiredCharacter = requiredCharacter;
    }
}
