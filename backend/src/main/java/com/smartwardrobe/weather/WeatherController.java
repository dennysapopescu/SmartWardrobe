package com.smartwardrobe.weather;

import com.smartwardrobe.weather.dto.WeatherDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
@Tag(name = "Weather", description = "Real-time meteorological forecast & clothing recommendations")
public class WeatherController {

    private final WeatherService weatherService;

    @Operation(summary = "Get current weather", description = "Fetch real-time weather conditions and clothing advice by coordinates or city name via Open-Meteo")
    @GetMapping("/current")
    public ResponseEntity<WeatherDto> getCurrentWeather(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) String city
    ) {
        return ResponseEntity.ok(weatherService.getCurrentWeather(latitude, longitude, city));
    }
}
