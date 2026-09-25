package com.smartwardrobe.outfit;

import com.smartwardrobe.ai.GeminiAiService;
import com.smartwardrobe.ai.dto.AiOutfitAdviceResponse;
import com.smartwardrobe.clothing.ClothingCategory;
import com.smartwardrobe.clothing.ClothingItem;
import com.smartwardrobe.clothing.ClothingRepository;
import com.smartwardrobe.outfit.dto.OutfitGenerateRequest;
import com.smartwardrobe.outfit.dto.OutfitResponse;
import com.smartwardrobe.outfit.rule.*;
import com.smartwardrobe.weather.WeatherService;
import com.smartwardrobe.weather.dto.WeatherDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OutfitRecommendationServiceTest {

    @Mock
    private ClothingRepository clothingRepository;

    @Mock
    private WeatherService weatherService;

    @Mock
    private GeminiAiService geminiAiService;

    @Mock
    private OutfitRepository outfitRepository;

    private OutfitRecommendationService outfitRecommendationService;

    private ClothingItem whiteSneakers;
    private ClothingItem stilettoPumps;
    private ClothingItem sportsTank;
    private ClothingItem yogaLeggings;
    private ClothingItem pleatedTrousers;
    private ClothingItem silkBlouse;
    private ClothingItem slipDress;
    private ClothingItem woolCoat;
    private ClothingItem warmHoodie;

    @BeforeEach
    void setUp() {
        outfitRecommendationService = new OutfitRecommendationService(
                clothingRepository,
                weatherService,
                geminiAiService,
                outfitRepository,
                List.of(
                        new OccasionStyleRule(),
                        new SportyFootwearRule(),
                        new SportyApparelRule(),
                        new WeatherTemperatureRule(),
                        new ColorHarmonyRule()
                )
        );

        whiteSneakers = ClothingItem.builder()
                .id(1L)
                .name("Cloudfoam Athletic Running Sneakers")
                .category(ClothingCategory.SHOES)
                .subCategory("Running Sneakers")
                .style("SPORTY")
                .primaryColor("White")
                .warmthLevel(2)
                .build();

        stilettoPumps = ClothingItem.builder()
                .id(2L)
                .name("Pointed-Toe Nude Stiletto Pumps")
                .category(ClothingCategory.SHOES)
                .subCategory("Stilettos")
                .style("ELEGANT")
                .primaryColor("Nude")
                .warmthLevel(2)
                .build();

        sportsTank = ClothingItem.builder()
                .id(3L)
                .name("Breathable Ribbed Sports Tank Top")
                .category(ClothingCategory.TOPS)
                .subCategory("Sports Tank")
                .style("SPORTY")
                .primaryColor("Sage Green")
                .warmthLevel(1)
                .build();

        yogaLeggings = ClothingItem.builder()
                .id(4L)
                .name("High-Waist Seamless Yoga Leggings")
                .category(ClothingCategory.BOTTOMS)
                .subCategory("Yoga Leggings")
                .style("SPORTY")
                .primaryColor("Charcoal")
                .warmthLevel(2)
                .build();

        pleatedTrousers = ClothingItem.builder()
                .id(5L)
                .name("Tailored Pleated Trousers")
                .category(ClothingCategory.BOTTOMS)
                .subCategory("Dress Pants")
                .style("OFFICE")
                .primaryColor("Black")
                .warmthLevel(3)
                .build();

        silkBlouse = ClothingItem.builder()
                .id(6L)
                .name("Silk Satin Evening Blouse")
                .category(ClothingCategory.TOPS)
                .subCategory("Button-Down")
                .style("OFFICE")
                .primaryColor("White")
                .warmthLevel(2)
                .build();

        slipDress = ClothingItem.builder()
                .id(7L)
                .name("Emerald Silk Slip Dress")
                .category(ClothingCategory.DRESSES)
                .subCategory("Slip Dress")
                .style("ELEGANT")
                .primaryColor("Emerald")
                .warmthLevel(2)
                .build();

        woolCoat = ClothingItem.builder()
                .id(8L)
                .name("Wool Blend Tailored Longline Coat")
                .category(ClothingCategory.OUTERWEAR)
                .subCategory("Winter Coat")
                .style("OFFICE")
                .primaryColor("Camel")
                .warmthLevel(5)
                .build();

        warmHoodie = ClothingItem.builder()
                .id(9L)
                .name("Oversized Cozy Fleece Workout Hoodie")
                .category(ClothingCategory.OUTERWEAR)
                .subCategory("Athletic Hoodie")
                .style("SPORTY")
                .primaryColor("Grey")
                .warmthLevel(4)
                .build();
    }

    private void mockAiAdvice() {
        when(geminiAiService.generateOutfitAdvice(anyString(), anyString(), anyList(), any()))
                .thenReturn(AiOutfitAdviceResponse.builder()
                        .title("Test Curated Outfit")
                        .explanation("Great harmony")
                        .colorPalette("Neutral balance")
                        .stylingTips(List.of("Pro tip 1"))
                        .build());
    }

    @Test
    @DisplayName("Yoga / Sporty occasion prioritizes sneakers and penalizes stilettos")
    void testYogaOccasion_PrioritizesSneakers_AndRejectsStilettos() {
        mockAiAdvice();
        List<ClothingItem> wardrobe = List.of(whiteSneakers, stilettoPumps, sportsTank, yogaLeggings, pleatedTrousers);
        when(clothingRepository.findAll()).thenReturn(wardrobe);

        WeatherDto mildWeather = WeatherDto.builder()
                .temperature(22.0)
                .condition("Clear")
                .clothingAdvice("Temperate weather")
                .build();
        when(weatherService.getCurrentWeather(any(), any(), any())).thenReturn(mildWeather);

        OutfitGenerateRequest request = OutfitGenerateRequest.builder()
                .occasion("yoga class")
                .city("Timisoara")
                .build();

        OutfitResponse response = outfitRecommendationService.generateOutfit(request, null);

        assertNotNull(response);
        boolean containsSneakers = response.getItems().stream()
                .anyMatch(i -> i.getName().equals("Cloudfoam Athletic Running Sneakers"));
        boolean containsStilettos = response.getItems().stream()
                .anyMatch(i -> i.getName().equals("Pointed-Toe Nude Stiletto Pumps"));

        assertTrue(containsSneakers, "Expected sporty outfit to select athletic sneakers");
        assertFalse(containsStilettos, "Expected sporty outfit to reject formal stilettos");
    }

    @Test
    @DisplayName("Cold weather (< 18°C) triggers mandatory outerwear layering")
    void testColdWeather_AutomaticallyLayersOuterwear() {
        mockAiAdvice();
        List<ClothingItem> wardrobe = List.of(whiteSneakers, sportsTank, yogaLeggings, warmHoodie);
        when(clothingRepository.findAll()).thenReturn(wardrobe);

        WeatherDto coldWeather = WeatherDto.builder()
                .temperature(11.0)
                .isCold(true)
                .isHot(false)
                .condition("Chilly")
                .clothingAdvice("Cold weather advice")
                .build();
        when(weatherService.getCurrentWeather(any(), any(), any())).thenReturn(coldWeather);

        OutfitGenerateRequest request = OutfitGenerateRequest.builder()
                .occasion("Morning jog")
                .city("Timisoara")
                .overrideTemperature(11.0)
                .build();

        OutfitResponse response = outfitRecommendationService.generateOutfit(request, null);

        assertNotNull(response);
        boolean hasOuterwear = response.getItems().stream()
                .anyMatch(i -> i.getCategory() == ClothingCategory.OUTERWEAR);
        assertTrue(hasOuterwear, "Outerwear must be included when temperature is cold (11°C)");
    }

    @Test
    @DisplayName("Hot weather (30°C) excludes heavy coats from recommendation")
    void testHotWeather_ExcludesHeavyCoats() {
        WeatherDto hotWeather = WeatherDto.builder()
                .temperature(30.0)
                .isCold(false)
                .isHot(true)
                .build();

        boolean coatAppropriate = outfitRecommendationService.isWeatherAppropriate(woolCoat, hotWeather);
        boolean tankAppropriate = outfitRecommendationService.isWeatherAppropriate(sportsTank, hotWeather);

        assertFalse(coatAppropriate, "Wool coat must be excluded in 30°C hot weather");
        assertTrue(tankAppropriate, "Lightweight sports tank must be allowed in 30°C hot weather");
    }

    @Test
    @DisplayName("Sporty workout occasion strictly excludes formal dresses")
    void testSportyOccasion_NeverChoosesDress() {
        mockAiAdvice();
        List<ClothingItem> wardrobe = List.of(whiteSneakers, sportsTank, yogaLeggings, slipDress);
        when(clothingRepository.findAll()).thenReturn(wardrobe);

        WeatherDto weather = WeatherDto.builder()
                .temperature(20.0)
                .condition("Sunny")
                .build();
        when(weatherService.getCurrentWeather(any(), any(), any())).thenReturn(weather);

        OutfitGenerateRequest request = OutfitGenerateRequest.builder()
                .occasion("gym workout")
                .city("Timisoara")
                .build();

        OutfitResponse response = outfitRecommendationService.generateOutfit(request, null);

        assertNotNull(response);
        boolean hasDress = response.getItems().stream()
                .anyMatch(i -> i.getCategory() == ClothingCategory.DRESSES);
        assertFalse(hasDress, "Dresses must not be chosen for gym or athletic workouts");
    }

    @Test
    @DisplayName("Locked item in request is preserved in the generated outfit")
    void testLockedItem_IsPreservedInOutfit() {
        mockAiAdvice();
        List<ClothingItem> wardrobe = List.of(whiteSneakers, stilettoPumps, silkBlouse, pleatedTrousers);
        when(clothingRepository.findAll()).thenReturn(wardrobe);
        when(clothingRepository.findById(2L)).thenReturn(java.util.Optional.of(stilettoPumps));

        WeatherDto weather = WeatherDto.builder().temperature(21.0).build();
        when(weatherService.getCurrentWeather(any(), any(), any())).thenReturn(weather);

        OutfitGenerateRequest request = OutfitGenerateRequest.builder()
                .occasion("Casual Day")
                .lockedItemIds(List.of(2L)) // Lock the stiletto pumps
                .build();

        OutfitResponse response = outfitRecommendationService.generateOutfit(request, null);

        assertNotNull(response);
        boolean hasLockedShoes = response.getItems().stream()
                .anyMatch(i -> i.getId().equals(2L));
        assertTrue(hasLockedShoes, "Locked item (ID 2) must remain in the final outfit");
    }

    @Test
    @DisplayName("Color harmony rule rewards complementary and neutral pairings")
    void testColorHarmonyRule_CalculatesPositiveScoreForHarmoniousPairs() {
        ColorHarmonyRule colorRule = new ColorHarmonyRule();

        ClothingItem whiteShirt = ClothingItem.builder().primaryColor("White").build();
        ClothingItem navyPants = ClothingItem.builder().primaryColor("Navy").build();

        OutfitContext context = OutfitContext.builder()
                .alreadySelectedItems(List.of(whiteShirt))
                .build();

        int score = colorRule.score(navyPants, context);
        assertTrue(score > 0, "Navy + White should produce positive harmony score");
    }

    @Test
    @DisplayName("Deterministic scoring evaluates items consistently without randomness")
    void testDeterministicItemScoring() {
        WeatherDto weather = WeatherDto.builder().temperature(20.0).isCold(false).isHot(false).build();
        OutfitContext sportyContext = OutfitContext.builder()
                .occasion("gym workout")
                .targetStyle("SPORTY")
                .weather(weather)
                .build();

        int sneakerScore = outfitRecommendationService.calculateItemScore(whiteSneakers, sportyContext);
        int stilettoScore = outfitRecommendationService.calculateItemScore(stilettoPumps, sportyContext);

        assertTrue(sneakerScore > stilettoScore, "Sneakers must score significantly higher than stilettos for gym");
        assertTrue(stilettoScore < 0, "Stilettos must receive a negative penalty for gym occasions");
    }

    @Test
    @DisplayName("Empty wardrobe throws IllegalStateException with informative message")
    void testEmptyWardrobe_ThrowsIllegalStateException() {
        when(clothingRepository.findAll()).thenReturn(Collections.emptyList());

        OutfitGenerateRequest request = OutfitGenerateRequest.builder().occasion("Office").build();

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                outfitRecommendationService.generateOutfit(request, null));
        assertTrue(ex.getMessage().contains("wardrobe is empty"));
    }

    @Test
    @DisplayName("Occasion mapping accurately maps keywords to target styles")
    void testOccasionStyleMapping() {
        assertEquals("SPORTY", outfitRecommendationService.mapOccasionToStyle("gym workout"));
        assertEquals("SPORTY", outfitRecommendationService.mapOccasionToStyle("yoga class"));
        assertEquals("ELEGANT", outfitRecommendationService.mapOccasionToStyle("Date Night Dinner"));
        assertEquals("ELEGANT", outfitRecommendationService.mapOccasionToStyle("Gala Cocktail"));
        assertEquals("OFFICE", outfitRecommendationService.mapOccasionToStyle("Client Presentation Meeting"));
        assertEquals("STREETWEAR", outfitRecommendationService.mapOccasionToStyle("Music Festival Concert"));
        assertEquals("CASUAL", outfitRecommendationService.mapOccasionToStyle("unknown custom occasion"));
    }

    @Test
    @DisplayName("Review custom outfit evaluates user-selected items with AI advice")
    void testReviewCustomOutfit_EvaluatesUserSelectedItems() {
        mockAiAdvice();
        when(clothingRepository.findById(1L)).thenReturn(java.util.Optional.of(whiteSneakers));
        when(clothingRepository.findById(4L)).thenReturn(java.util.Optional.of(yogaLeggings));

        WeatherDto weather = WeatherDto.builder().temperature(21.0).condition("Pleasant").build();
        when(weatherService.getCurrentWeather(any(), any(), any())).thenReturn(weather);

        com.smartwardrobe.outfit.dto.CustomOutfitReviewRequest request = com.smartwardrobe.outfit.dto.CustomOutfitReviewRequest.builder()
                .title("My Active Look")
                .occasion("Pilates Studio")
                .city("Timisoara")
                .itemIds(List.of(1L, 4L))
                .build();

        OutfitResponse response = outfitRecommendationService.reviewCustomOutfit(request, null);

        assertNotNull(response);
        assertEquals("My Active Look", response.getName());
        assertEquals("Pilates Studio", response.getOccasion());
        assertEquals(2, response.getItems().size());
        assertEquals("Great harmony", response.getStylingAdvice());
    }

    @Test
    @DisplayName("Review custom outfit throws IllegalArgumentException when item list is empty")
    void testReviewCustomOutfit_ThrowsWhenNoItems() {
        com.smartwardrobe.outfit.dto.CustomOutfitReviewRequest request = com.smartwardrobe.outfit.dto.CustomOutfitReviewRequest.builder()
                .title("Empty")
                .itemIds(Collections.emptyList())
                .build();

        assertThrows(IllegalArgumentException.class, () ->
                outfitRecommendationService.reviewCustomOutfit(request, null));
    }
}
