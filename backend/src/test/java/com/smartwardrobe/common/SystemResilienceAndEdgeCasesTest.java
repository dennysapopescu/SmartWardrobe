package com.smartwardrobe.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwardrobe.ai.GeminiAiService;
import com.smartwardrobe.ai.dto.AiOutfitAdviceResponse;
import com.smartwardrobe.auth.Role;
import com.smartwardrobe.auth.User;
import com.smartwardrobe.clothing.*;
import com.smartwardrobe.clothing.dto.ClothingRequest;
import com.smartwardrobe.clothing.dto.ClothingResponse;
import com.smartwardrobe.outfit.Outfit;
import com.smartwardrobe.outfit.OutfitRepository;
import com.smartwardrobe.outfit.OutfitRecommendationService;
import com.smartwardrobe.outfit.dto.OutfitGenerateRequest;
import com.smartwardrobe.weather.WeatherService;
import com.smartwardrobe.weather.dto.WeatherDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SystemResilienceAndEdgeCasesTest {

    @Mock
    private ClothingRepository clothingRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private OutfitRepository outfitRepository;

    @InjectMocks
    private ClothingService clothingService;

    // ─────────────────────────────────────────────────────────────
    // 1. Multi-Tenancy & User Isolation Security Tests
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Security: User A cannot delete User B's clothing item (throws AccessDeniedException)")
    void testUserCannotDeleteAnotherUsersItem() {
        User userA = User.builder().id(1L).email("usera@test.com").fullName("User A").role(Role.ROLE_USER).build();
        User userB = User.builder().id(2L).email("userb@test.com").fullName("User B").role(Role.ROLE_USER).build();

        ClothingItem itemBelongingToB = ClothingItem.builder()
                .id(100L)
                .name("Silk Evening Dress")
                .category(ClothingCategory.DRESSES)
                .user(userB)
                .build();

        when(clothingRepository.findById(100L)).thenReturn(Optional.of(itemBelongingToB));

        // User A attempts to delete User B's item
        assertThrows(AccessDeniedException.class, () -> clothingService.deleteItem(100L, userA));

        // Verify the item was NOT deleted
        verify(clothingRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Security: User A cannot update User B's clothing item (throws AccessDeniedException)")
    void testUserCannotUpdateAnotherUsersItem() {
        User userA = User.builder().id(1L).email("usera@test.com").fullName("User A").role(Role.ROLE_USER).build();
        User userB = User.builder().id(2L).email("userb@test.com").fullName("User B").role(Role.ROLE_USER).build();

        ClothingItem itemBelongingToB = ClothingItem.builder()
                .id(101L)
                .name("Cashmere Sweater")
                .category(ClothingCategory.TOPS)
                .user(userB)
                .build();

        when(clothingRepository.findById(101L)).thenReturn(Optional.of(itemBelongingToB));

        ClothingRequest updateRequest = ClothingRequest.builder()
                .name("Hacked Item Name")
                .category(ClothingCategory.TOPS)
                .primaryColor("Black")
                .build();

        assertThrows(AccessDeniedException.class, () -> clothingService.updateItem(101L, updateRequest, userA));
        verify(clothingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Security: Owner can delete their own clothing item successfully")
    void testOwnerCanDeleteOwnItem() {
        User userA = User.builder().id(1L).email("usera@test.com").fullName("User A").role(Role.ROLE_USER).build();

        ClothingItem itemBelongingToA = ClothingItem.builder()
                .id(102L)
                .name("Linen Shirt")
                .category(ClothingCategory.TOPS)
                .user(userA)
                .build();

        when(clothingRepository.findById(102L)).thenReturn(Optional.of(itemBelongingToA));

        assertDoesNotThrow(() -> clothingService.deleteItem(102L, userA));
        verify(clothingRepository, times(1)).delete(itemBelongingToA);
    }

    @Test
    @DisplayName("Security: User A cannot delete User B's saved outfit (throws AccessDeniedException)")
    void testUserCannotDeleteAnotherUsersOutfit() {
        User userA = User.builder().id(1L).email("usera@test.com").fullName("User A").role(Role.ROLE_USER).build();
        User userB = User.builder().id(2L).email("userb@test.com").fullName("User B").role(Role.ROLE_USER).build();

        Outfit outfitBelongingToB = Outfit.builder()
                .id(200L)
                .name("Summer Riviera Ensemble")
                .user(userB)
                .build();

        OutfitRepository outfitRepo = mock(OutfitRepository.class);
        when(outfitRepo.findById(200L)).thenReturn(Optional.of(outfitBelongingToB));

        OutfitRecommendationService service = new OutfitRecommendationService(
                clothingRepository,
                mock(WeatherService.class),
                mock(GeminiAiService.class),
                outfitRepo,
                null
        );

        assertThrows(AccessDeniedException.class, () -> service.deleteOutfit(200L, userA));
        verify(outfitRepo, never()).delete(any());
    }

    @Test
    @DisplayName("Security: User A cannot toggle favorite on User B's outfit (throws AccessDeniedException)")
    void testUserCannotToggleFavoriteOnAnotherUsersOutfit() {
        User userA = User.builder().id(1L).email("usera@test.com").fullName("User A").role(Role.ROLE_USER).build();
        User userB = User.builder().id(2L).email("userb@test.com").fullName("User B").role(Role.ROLE_USER).build();

        Outfit outfitBelongingToB = Outfit.builder()
                .id(201L)
                .name("Autumn Trench Outfit")
                .favorite(false)
                .user(userB)
                .build();

        OutfitRepository outfitRepo = mock(OutfitRepository.class);
        when(outfitRepo.findById(201L)).thenReturn(Optional.of(outfitBelongingToB));

        OutfitRecommendationService service = new OutfitRecommendationService(
                clothingRepository,
                mock(WeatherService.class),
                mock(GeminiAiService.class),
                outfitRepo,
                null
        );

        assertThrows(AccessDeniedException.class, () -> service.toggleFavorite(201L, userA));
        verify(outfitRepo, never()).save(any());
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Weather Fallback Resilience Test
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Weather Fallback: When Open-Meteo API is unreachable, service returns safe default without crashing")
    void testWeatherFallbackWhenApiUnreachable() {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);
        when(mockRestTemplate.getForEntity(anyString(), any()))
                .thenThrow(new ResourceAccessException("I/O error on GET request: Connection timed out"));

        RestTemplateBuilder builder = mock(RestTemplateBuilder.class);
        when(builder.setConnectTimeout(any())).thenReturn(builder);
        when(builder.setReadTimeout(any())).thenReturn(builder);
        when(builder.build()).thenReturn(mockRestTemplate);

        WeatherService weatherService = new WeatherService(
                builder,
                new ObjectMapper(),
                "https://api.open-meteo.com/v1/forecast"
        );

        WeatherDto fallbackWeather = weatherService.getCurrentWeather(44.4268, 26.1025, "Bucharest");

        assertNotNull(fallbackWeather);
        assertEquals("Bucharest", fallbackWeather.getLocationName());
        assertEquals(20.0, fallbackWeather.getTemperature());
        assertFalse(fallbackWeather.isRaining());
        assertNotNull(fallbackWeather.getClothingAdvice());
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Gemini Multimodal AI Fallback Resilience Test
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("AI Fallback: When Gemini API encounters error, service returns smart rule-based advice seamlessly")
    void testGeminiFallbackOnApiFailure() {
        RestTemplateBuilder builder = mock(RestTemplateBuilder.class);
        when(builder.setConnectTimeout(any())).thenReturn(builder);
        when(builder.setReadTimeout(any())).thenReturn(builder);
        when(builder.build()).thenReturn(mock(RestTemplate.class));

        GeminiAiService geminiService = new GeminiAiService(
                builder,
                new ObjectMapper(),
                "", // empty api key triggers smart mock fallback
                "gemini-1.5-flash"
        );

        ClothingItem mockTop = ClothingItem.builder()
                .id(1L)
                .name("Charcoal Wool Coat")
                .category(ClothingCategory.OUTERWEAR)
                .primaryColor("Charcoal")
                .style("OFFICE")
                .warmthLevel(4)
                .build();

        AiOutfitAdviceResponse advice = geminiService.generateOutfitAdvice(
                "OFFICE",
                "12.0°C (Overcast)",
                List.of(mockTop),
                null
        );

        assertNotNull(advice);
        assertNotNull(advice.getTitle());
        assertNotNull(advice.getExplanation());
        assertNotNull(advice.getColorPalette());
        assertFalse(advice.getStylingTips().isEmpty());
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Incomplete / Empty Wardrobe Edge Case
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Outfit Engine Edge Case: Throws descriptive IllegalStateException when wardrobe is completely empty")
    void testEmptyWardrobeThrowsInformativeException() {
        ClothingRepository emptyRepo = mock(ClothingRepository.class);
        when(emptyRepo.findByUser(any())).thenReturn(Collections.emptyList());

        WeatherService mockWeather = mock(WeatherService.class);
        GeminiAiService mockGemini = mock(GeminiAiService.class);

        OutfitRecommendationService recommendationService = new OutfitRecommendationService(
                emptyRepo,
                mockWeather,
                mockGemini,
                mock(com.smartwardrobe.outfit.OutfitRepository.class),
                null
        );

        User user = User.builder().id(99L).email("empty@wardrobe.com").build();
        OutfitGenerateRequest request = new OutfitGenerateRequest();
        request.setOccasion("CASUAL");

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> recommendationService.generateOutfit(request, null, user)
        );

        assertTrue(ex.getMessage().contains("wardrobe is empty"));
        verify(emptyRepo, never()).findAll();
    }

    @Test
    @DisplayName("Relational Integrity: Deleting a clothing item cleanly unlinks it from outfits")
    void testDeleteItemUnlinksFromOutfits() {
        User user = User.builder().id(10L).email("owner@test.com").build();
        ClothingItem item = ClothingItem.builder().id(50L).user(user).name("Jeans").category(ClothingCategory.BOTTOMS).build();

        when(clothingRepository.findById(50L)).thenReturn(Optional.of(item));

        clothingService.deleteItem(50L, user);

        verify(outfitRepository, times(1)).deleteOutfitItemAssociations(50L);
        verify(clothingRepository, times(1)).delete(item);
    }

    @Test
    @DisplayName("Weather Service: Resolves city name to coordinates when lat/lon not provided")
    void testWeatherServiceCityResolution() {
        WeatherService weatherService = new WeatherService(
                new RestTemplateBuilder(),
                new ObjectMapper(),
                "https://api.open-meteo.com/v1/forecast"
        );

        WeatherDto weather = weatherService.getCurrentWeather(null, null, "Paris");
        assertNotNull(weather);
        assertEquals("Paris", weather.getLocationName());
    }
}
