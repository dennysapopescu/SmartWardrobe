package com.smartwardrobe.outfit.rule;

import com.smartwardrobe.clothing.ClothingCategory;
import com.smartwardrobe.clothing.ClothingItem;
import com.smartwardrobe.weather.dto.WeatherDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class OutfitScoringRulesTest {

    private final OccasionStyleRule occasionStyleRule = new OccasionStyleRule();
    private final SportyFootwearRule sportyFootwearRule = new SportyFootwearRule();
    private final SportyApparelRule sportyApparelRule = new SportyApparelRule();
    private final WeatherTemperatureRule weatherRule = new WeatherTemperatureRule();
    private final ColorHarmonyRule colorRule = new ColorHarmonyRule();

    @Test
    @DisplayName("OccasionStyleRule gives highest score to matching style")
    void testOccasionStyleRule_MatchingStyles() {
        ClothingItem officeSuit = ClothingItem.builder().style("OFFICE").build();
        ClothingItem sportyItem = ClothingItem.builder().style("SPORTY").build();

        OutfitContext officeContext = OutfitContext.builder().targetStyle("OFFICE").build();

        int officeScore = occasionStyleRule.score(officeSuit, officeContext);
        int sportyScore = occasionStyleRule.score(sportyItem, officeContext);

        assertEquals(120, officeScore, "Matching style should receive maximum affinity bonus (120)");
        assertTrue(sportyScore < 0, "Sporty items should receive penalty in office context");
    }

    @Test
    @DisplayName("SportyFootwearRule penalizes stilettos and rewards trainers")
    void testSportyFootwearRule() {
        ClothingItem sneakers = ClothingItem.builder()
                .category(ClothingCategory.SHOES)
                .name("Running Cloudfoam")
                .subCategory("Trainers")
                .build();

        ClothingItem stilettos = ClothingItem.builder()
                .category(ClothingCategory.SHOES)
                .name("Pointed Stiletto Pumps")
                .subCategory("High Heels")
                .build();

        OutfitContext yogaContext = OutfitContext.builder()
                .occasion("Morning yoga")
                .targetStyle("SPORTY")
                .build();

        assertEquals(100, sportyFootwearRule.score(sneakers, yogaContext));
        assertEquals(-300, sportyFootwearRule.score(stilettos, yogaContext));
    }

    @Test
    @DisplayName("SportyApparelRule rewards leggings and penalizes formal trousers")
    void testSportyApparelRule() {
        ClothingItem leggings = ClothingItem.builder()
                .category(ClothingCategory.BOTTOMS)
                .name("Seamless Yoga Leggings")
                .subCategory("Activewear")
                .build();

        ClothingItem dressPants = ClothingItem.builder()
                .category(ClothingCategory.BOTTOMS)
                .name("Tailored Dress Pants")
                .subCategory("Pleated Trouser")
                .build();

        OutfitContext gymContext = OutfitContext.builder()
                .occasion("Gym workout")
                .targetStyle("SPORTY")
                .build();

        assertEquals(100, sportyApparelRule.score(leggings, gymContext));
        assertEquals(-120, sportyApparelRule.score(dressPants, gymContext));
    }

    @Test
    @DisplayName("WeatherTemperatureRule rewards warm clothing and coats in freezing weather")
    void testWeatherTemperatureRule_Cold() {
        ClothingItem winterCoat = ClothingItem.builder()
                .category(ClothingCategory.OUTERWEAR)
                .name("Wool Longline Coat")
                .warmthLevel(5)
                .build();

        ClothingItem linenShorts = ClothingItem.builder()
                .category(ClothingCategory.BOTTOMS)
                .name("Linen Summer Shorts")
                .warmthLevel(1)
                .build();

        WeatherDto coldWeather = WeatherDto.builder()
                .temperature(5.0)
                .isCold(true)
                .isHot(false)
                .build();

        OutfitContext coldContext = OutfitContext.builder()
                .weather(coldWeather)
                .build();

        assertTrue(weatherRule.score(winterCoat, coldContext) > 0, "Wool coat must get positive score in cold weather");
        assertTrue(weatherRule.score(linenShorts, coldContext) < 0, "Linen shorts must get penalty in cold weather");
    }

    @Test
    @DisplayName("ColorHarmonyRule rewards tonal matches and universal neutrals")
    void testColorHarmonyRule_NeutralsAndComplements() {
        ClothingItem blackBlazer = ClothingItem.builder().primaryColor("Black").build();
        ClothingItem whiteTee = ClothingItem.builder().primaryColor("White").build();
        ClothingItem camelPants = ClothingItem.builder().primaryColor("Camel").build();

        OutfitContext withBlack = OutfitContext.builder()
                .alreadySelectedItems(List.of(blackBlazer))
                .build();

        int whiteScore = colorRule.score(whiteTee, withBlack);
        int camelScore = colorRule.score(camelPants, withBlack);

        assertTrue(whiteScore > 0, "White + Black should yield strong harmony bonus");
        assertTrue(camelScore > 0, "Camel + Black should yield neutral compatibility bonus");
    }
}
