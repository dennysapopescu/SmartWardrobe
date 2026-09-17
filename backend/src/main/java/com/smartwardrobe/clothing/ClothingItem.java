package com.smartwardrobe.clothing;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "clothing_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClothingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClothingCategory category;

    private String subCategory;

    @Column(nullable = false)
    private String primaryColor;

    private String secondaryColor;

    private String pattern;

    @Column(nullable = false)
    private String style; // CASUAL, ELEGANT, OFFICE, STREETWEAR, PARTY, SPORTY

    @Column(nullable = false)
    private String season; // SPRING, SUMMER, FALL, WINTER, ALL_SEASON

    private Integer warmthLevel; // 1 (very light) to 5 (heavy winter)

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Builder.Default
    private boolean favorite = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (warmthLevel == null) {
            warmthLevel = 2;
        }
        if (style == null) {
            style = "CASUAL";
        }
        if (season == null) {
            season = "ALL_SEASON";
        }
    }
}
