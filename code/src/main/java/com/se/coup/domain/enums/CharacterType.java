package com.se.coup.domain.enums;

import lombok.Getter;

@Getter
public enum CharacterType {
    KING("ราชา", "ราษฎรทั้งหลาย จงถวายภาษีแด่ข้า", "เก็บภาษีหลวง รับ 3 เหรียญ", "บล็อกส่วยจากหัวเมือง"),
    ADVENTURER("นักผจญภัย", "สมบัติชิ้นนั้น… ข้าเห็นก่อน", "ปล้น 2 เหรียญจากผู้เล่นคนหนึ่ง", "บล็อกการชิงสมบัติ"),
    ASSASSIN("นักฆ่า", "เจ้าจะไม่ได้ยินเสียงข้าเข้ามา", "จ่าย 3 เหรียญ สังหารอิทธิพล 1 ใบ", "ไม่มี"),
    SAINT("สตรีศักดิ์สิทธิ์", "แสงศักดิ์สิทธิ์คุ้มครองข้า มีดของเจ้าไร้ผล", "ไม่มีแอ็กชันของตัวเอง", "บล็อกการลอบสังหาร"),
    MERCHANT("พ่อค้า", "ข้ามีของดีจากแดนไกล สนใจแลกไหมล่ะ", "จั่ว 2 ใบ เลือกเก็บ 2 คืนที่เหลือ", "บล็อกการชิงสมบัติ");

    private final String thName;
    private final String quote;
    private final String abilityDescription;
    private final String blockDescription;

    CharacterType(String thName, String quote, String abilityDescription, String blockDescription) {
        this.thName = thName;
        this.quote = quote;
        this.abilityDescription = abilityDescription;
        this.blockDescription = blockDescription;
    }
}
