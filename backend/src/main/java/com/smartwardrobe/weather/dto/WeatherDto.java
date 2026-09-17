package com.smartwardrobe.weather.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherDto {
    private double temperature;
    private double apparentTemperature;
    private int weatherCode;
    private String condition;
    private String icon;
    private boolean isRaining;
    private boolean isCold;
    private boolean isHot;
    private String clothingAdvice;
    private List<String> applicableSeasons;
    private int recommendedWarmthMin;
    private int recommendedWarmthMax;
    private String locationName;
}
