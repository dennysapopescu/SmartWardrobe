package com.smartwardrobe.weather;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwardrobe.weather.dto.WeatherDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
public class WeatherService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String baseUrl;

    public WeatherService(
            RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper,
            @Value("${app.weather.base-url:https://api.open-meteo.com/v1/forecast}") String baseUrl
    ) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(3))
                .setReadTimeout(Duration.ofSeconds(4))
                .build();
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
    }

    public WeatherDto getCurrentWeather(Double latitude, Double longitude, String locationName) {
        // Default coordinates: Timisoara, Romania if not provided
        double lat = (latitude != null) ? latitude : 45.7537;
        double lon = (longitude != null) ? longitude : 21.2257;
        String city = (locationName != null && !locationName.trim().isEmpty()) ? locationName : "Timisoara";

        String url = String.format(
                "%s?latitude=%.4f&longitude=%.4f&current=temperature_2m,apparent_temperature,precipitation,weather_code&timezone=auto",
                baseUrl, lat, lon
        );

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode current = root.path("current");

                double temp = current.path("temperature_2m").asDouble(20.0);
                double apparentTemp = current.path("apparent_temperature").asDouble(temp);
                double precipitation = current.path("precipitation").asDouble(0.0);
                int code = current.path("weather_code").asInt(0);

                return buildWeatherDto(temp, apparentTemp, precipitation, code, city);
            }
        } catch (Exception e) {
            log.warn("Could not fetch live weather from Open-Meteo ({}), using default fallback: {}", url, e.getMessage());
        }

        // Safe fallback
        return buildWeatherDto(20.0, 20.0, 0.0, 1, city);
    }

    private WeatherDto buildWeatherDto(double temp, double apparentTemp, double precipitation, int code, String city) {
        boolean isRaining = precipitation > 0.1 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
        boolean isCold = temp < 14.0;
        boolean isHot = temp >= 25.0;

        String condition;
        String icon;
        String advice;
        List<String> seasons;
        int minWarmth;
        int maxWarmth;

        if (code == 0) {
            condition = "Clear Sky";
            icon = "sun";
        } else if (code <= 3) {
            condition = "Partly Cloudy";
            icon = "cloud-sun";
        } else if (code >= 51 && code <= 67) {
            condition = "Rain";
            icon = "cloud-rain";
        } else if (code >= 71 && code <= 77) {
            condition = "Snow";
            icon = "snowflake";
        } else if (code >= 95) {
            condition = "Thunderstorm";
            icon = "cloud-lightning";
        } else {
            condition = "Overcast";
            icon = "cloud";
        }

        if (temp >= 26.0) {
            advice = "Very warm (" + Math.round(temp) + "°C). Opt for breathable linen, lightweight cotton, breezy dresses, and open-toe footwear.";
            seasons = Arrays.asList("SUMMER", "ALL_SEASON");
            minWarmth = 1;
            maxWarmth = 2;
        } else if (temp >= 19.0) {
            advice = "Pleasant and temperate (" + Math.round(temp) + "°C). Ideal for comfortable layers, a tailored shirt or tee, and an optional light blazer.";
            seasons = Arrays.asList("SPRING", "SUMMER", "FALL", "ALL_SEASON");
            minWarmth = 1;
            maxWarmth = 3;
        } else if (temp >= 12.0) {
            advice = "Cool and crisp (" + Math.round(temp) + "°C). We recommend stylish layering: a fine knit or blazer paired with a classic trench coat.";
            seasons = Arrays.asList("SPRING", "FALL", "ALL_SEASON");
            minWarmth = 2;
            maxWarmth = 4;
        } else {
            advice = "Cold weather (" + Math.round(temp) + "°C). Layer up with a tailored wool coat, cozy cashmere knitwear, and leather boots.";
            seasons = Arrays.asList("WINTER", "FALL", "ALL_SEASON");
            minWarmth = 3;
            maxWarmth = 5;
        }

        if (isRaining) {
            advice += " Rain alert: Carry an umbrella and avoid suede footwear.";
        }

        return WeatherDto.builder()
                .temperature(Math.round(temp * 10.0) / 10.0)
                .apparentTemperature(Math.round(apparentTemp * 10.0) / 10.0)
                .weatherCode(code)
                .condition(condition)
                .icon(icon)
                .isRaining(isRaining)
                .isCold(isCold)
                .isHot(isHot)
                .clothingAdvice(advice)
                .applicableSeasons(seasons)
                .recommendedWarmthMin(minWarmth)
                .recommendedWarmthMax(maxWarmth)
                .locationName(city)
                .build();
    }
}
