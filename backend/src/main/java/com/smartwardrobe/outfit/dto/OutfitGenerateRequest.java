package com.smartwardrobe.outfit.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutfitGenerateRequest {
    private String occasion; // CASUAL, OFFICE, DATE_NIGHT, BRUNCH, PARTY, SPORT
    private Double latitude;
    private Double longitude;
    private String city;
    private Double overrideTemperature;
    private List<Long> lockedItemIds; // items the user manually pinned
}
