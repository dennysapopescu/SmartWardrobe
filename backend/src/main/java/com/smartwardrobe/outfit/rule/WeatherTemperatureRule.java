package com.smartwardrobe.outfit.rule;

import com.smartwardrobe.clothing.ClothingCategory;
import com.smartwardrobe.clothing.ClothingItem;
import com.smartwardrobe.weather.dto.WeatherDto;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(40)
public class WeatherTemperatureRule implements OutfitScoringRule {

    @Override
    public int score(ClothingItem item, OutfitContext context) {
        WeatherDto weather = context.getWeather();
        if (weather == null) {
            return 0;
        }

        int score = 0;
        int warmth = (item.getWarmthLevel() != null) ? item.getWarmthLevel() : 2;
        String name = (item.getName() != null) ? item.getName().toLowerCase() : "";
        String subCat = (item.getSubCategory() != null) ? item.getSubCategory().toLowerCase() : "";
        String text = name + " " + subCat;

        double temp = weather.getTemperature();
        boolean isChillyOrCold = weather.isCold() || temp <= 16.0;

        if (isChillyOrCold) {
            // Cold/chilly weather (<= 16°C, including 14°C): reward warmth, heavily penalize summer/slip pieces
            if (warmth >= 3) {
                score += 40;
            } else if (warmth == 1) {
                score -= 80;
            }

            if (item.getCategory() == ClothingCategory.OUTERWEAR) {
                score += 35;
            }
            if (text.contains("wool") || text.contains("cashmere") || text.contains("fleece") || text.contains("boots") || text.contains("trousers")) {
                score += 30;
            }
            if (text.contains("slip") || text.contains("linen") || text.contains("sandal") || text.contains("sleeveless") || text.contains("strappy")) {
                score -= 80;
            }
        } else if (weather.isHot() || temp >= 25.0) {
            // Hot weather rewards lightweight pieces and penalizes heavy outerwear/knitwear
            if (warmth == 1) {
                score += 40;
            }
            if (text.contains("linen") || text.contains("cotton") || text.contains("tank") || text.contains("sandal")) {
                score += 30;
            }
            if (item.getCategory() == ClothingCategory.OUTERWEAR || warmth >= 4 || text.contains("wool") || text.contains("coat") || text.contains("cashmere")) {
                score -= 100;
            }
        }

        return score;
    }
}
