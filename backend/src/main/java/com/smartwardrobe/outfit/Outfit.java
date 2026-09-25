package com.smartwardrobe.outfit;

import com.smartwardrobe.clothing.ClothingItem;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "outfits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Outfit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private com.smartwardrobe.auth.User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String occasion;

    private String weatherCondition;

    @Column(columnDefinition = "TEXT")
    private String stylingAdvice;

    private String colorPalette;

    @Builder.Default
    private boolean favorite = false;

    private LocalDateTime createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "outfit_items",
            joinColumns = @JoinColumn(name = "outfit_id"),
            inverseJoinColumns = @JoinColumn(name = "clothing_item_id")
    )
    @Builder.Default
    private List<ClothingItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
