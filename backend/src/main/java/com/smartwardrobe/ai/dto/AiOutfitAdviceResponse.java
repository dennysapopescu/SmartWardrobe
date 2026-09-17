package com.smartwardrobe.ai.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiOutfitAdviceResponse {
    private String title;
    private String explanation;
    private List<String> stylingTips;
    private String colorPalette;
    private boolean simulated;
}
