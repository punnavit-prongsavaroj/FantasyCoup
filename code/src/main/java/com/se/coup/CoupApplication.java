package com.se.coup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing // จำเป็นมากสำหรับ BaseEntity (Auditing)
public class CoupApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoupApplication.class, args);
    }
}