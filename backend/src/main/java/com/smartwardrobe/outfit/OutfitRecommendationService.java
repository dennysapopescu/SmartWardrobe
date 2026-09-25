package com.smartwardrobe.outfit;

import com.smartwardrobe.ai.GeminiAiService;
import com.smartwardrobe.ai.dto.AiOutfitAdviceResponse;
import com.smartwardrobe.clothing.ClothingCategory;
import com.smartwardrobe.clothing.ClothingItem;
import com.smartwardrobe.clothing.ClothingRepository;
import com.smartwardrobe.clothing.dto.ClothingResponse;
import com.smartwardrobe.common.exception.ResourceNotFoundException;
import com.smartwardrobe.outfit.dto.CustomOutfitReviewRequest;
import com.smartwardrobe.outfit.dto.OutfitGenerateRequest;
import com.smartwardrobe.outfit.dto.OutfitResponse;
import com.smartwardrobe.outfit.rule.*;
import com.smartwardrobe.weather.WeatherService;
import com.smartwardrobe.weather.dto.WeatherDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OutfitRecommendationService {

    private final ClothingRepository clothingRepository;
    private final WeatherService weatherService;
    private final GeminiAiService geminiAiService;
    private final OutfitRepository outfitRepository;
    private final List<OutfitScoringRule> scoringRules;

    public OutfitRecommendationService(
            ClothingRepository clothingRepository,
            WeatherService weatherService,
            GeminiAiService geminiAiService,
            OutfitRepository outfitRepository,
            List<OutfitScoringRule> scoringRules) {
        this.clothingRepository = clothingRepository;
        this.weatherService = weatherService;
        this.geminiAiService = geminiAiService;
        this.outfitRepository = outfitRepository;
        this.scoringRules = (scoringRules != null && !scoringRules.isEmpty())
                ? scoringRules
                : List.of(
                    new OccasionStyleRule(),
                    new SportyFootwearRule(),
                    new SportyApparelRule(),
                    new WeatherTemperatureRule(),
                    new ColorHarmonyRule()
                );
    }

    public OutfitResponse generateOutfit(OutfitGenerateRequest request, String clientApiKey) {
        return generateOutfit(request, clientApiKey, null);
    }

    public OutfitResponse generateOutfit(OutfitGenerateRequest request, String clientApiKey, com.smartwardrobe.auth.User user) {
        List<ClothingItem> allClothes = (user != null)
                ? clothingRepository.findByUser(user)
                : Collections.emptyList();

        if (allClothes.isEmpty()) {
            allClothes = clothingRepository.findAll();
        }

        if (allClothes.isEmpty()) {
            throw new IllegalStateException("Your wardrobe is empty! Add clothing items or click 'Load Demo Capsule' to generate outfits.");
        }

        // 1. Get weather
        WeatherDto weather = weatherService.getCurrentWeather(
                request.getLatitude(),
                request.getLongitude(),
                request.getCity()
        );
        if (request.getOverrideTemperature() != null) {
            weather.setTemperature(request.getOverrideTemperature());
            weather.setCold(request.getOverrideTemperature() < 14.0);
            weather.setHot(request.getOverrideTemperature() >= 25.0);
        }

        String occasion = (request.getOccasion() != null && !request.getOccasion().trim().isEmpty())
                ? request.getOccasion().trim()
                : "CASUAL";

        // 2. Filter candidates based on temperature & weather
        List<ClothingItem> suitable = allClothes.stream()
                .filter(item -> isWeatherAppropriate(item, weather))
                .collect(Collectors.toList());

        if (suitable.isEmpty()) {
            suitable = allClothes; // Fallback if filters are too strict
        }

        // Group by category
        Map<ClothingCategory, List<ClothingItem>> byCategory = suitable.stream()
                .collect(Collectors.groupingBy(ClothingItem::getCategory));

        // 3. Assemble outfit combination
        List<ClothingItem> selectedItems = new ArrayList<>();
        Random random = new Random();

        // Check locked items from request
        if (request.getLockedItemIds() != null && !request.getLockedItemIds().isEmpty()) {
            for (Long lockedId : request.getLockedItemIds()) {
                clothingRepository.findById(lockedId).ifPresent(selectedItems::add);
            }
        }

        Set<ClothingCategory> coveredCategories = selectedItems.stream()
                .map(ClothingItem::getCategory)
                .collect(Collectors.toSet());

        boolean hasDress = coveredCategories.contains(ClothingCategory.DRESSES);
        boolean hasTop = coveredCategories.contains(ClothingCategory.TOPS);
        boolean hasBottom = coveredCategories.contains(ClothingCategory.BOTTOMS);

        String targetStyle = mapOccasionToStyle(occasion);
        boolean isSporty = "SPORTY".equalsIgnoreCase(targetStyle);

        // Decide between Dress OR (Top + Bottom)
        // Never choose a dress for sporty/gym/yoga occasions unless explicitly requested
        boolean chooseDress = !isSporty && !hasTop && !hasBottom && (hasDress || (byCategory.containsKey(ClothingCategory.DRESSES) && random.nextBoolean()));

        if (chooseDress) {
            if (!hasDress && byCategory.containsKey(ClothingCategory.DRESSES)) {
                addItem(selectedItems, pickBestCandidate(byCategory.get(ClothingCategory.DRESSES), occasion, targetStyle, weather, selectedItems));
            }
        } else {
            if (!hasTop && byCategory.containsKey(ClothingCategory.TOPS)) {
                addItem(selectedItems, pickBestCandidate(byCategory.get(ClothingCategory.TOPS), occasion, targetStyle, weather, selectedItems));
            }
            if (!hasBottom && byCategory.containsKey(ClothingCategory.BOTTOMS)) {
                addItem(selectedItems, pickBestCandidate(byCategory.get(ClothingCategory.BOTTOMS), occasion, targetStyle, weather, selectedItems));
            }
        }

        // Footwear (Shoes)
        if (!coveredCategories.contains(ClothingCategory.SHOES) && byCategory.containsKey(ClothingCategory.SHOES)) {
            addItem(selectedItems, pickBestCandidate(byCategory.get(ClothingCategory.SHOES), occasion, targetStyle, weather, selectedItems));
        }

        // Outerwear (required if cold or chilly, or formal office style)
        boolean needsOuterwear = weather.isCold() || weather.getTemperature() < 18.0 || "OFFICE".equalsIgnoreCase(targetStyle);
        if (needsOuterwear && !coveredCategories.contains(ClothingCategory.OUTERWEAR) && byCategory.containsKey(ClothingCategory.OUTERWEAR)) {
            addItem(selectedItems, pickBestCandidate(byCategory.get(ClothingCategory.OUTERWEAR), occasion, targetStyle, weather, selectedItems));
        }

        // Optional Accessory
        if (!coveredCategories.contains(ClothingCategory.ACCESSORIES) && byCategory.containsKey(ClothingCategory.ACCESSORIES)) {
            if (random.nextDouble() > 0.3) {
                addItem(selectedItems, pickBestCandidate(byCategory.get(ClothingCategory.ACCESSORIES), occasion, targetStyle, weather, selectedItems));
            }
        }

        // 4. Generate AI Stylist Advice
        String weatherSummary = String.format("%.1f°C (%s)", weather.getTemperature(), weather.getCondition());
        AiOutfitAdviceResponse advice = geminiAiService.generateOutfitAdvice(occasion, weatherSummary, selectedItems, clientApiKey);

        // 5. Build response
        return OutfitResponse.builder()
                .id(null)
                .name(advice.getTitle())
                .occasion(occasion)
                .weatherCondition(weatherSummary)
                .stylingAdvice(advice.getExplanation())
                .colorPalette(advice.getColorPalette())
                .stylingTips(advice.getStylingTips())
                .favorite(false)
                .items(selectedItems.stream().map(ClothingResponse::fromEntity).collect(Collectors.toList()))
                .createdAt(LocalDateTime.now())
                .build();
    }

    public OutfitResponse reviewCustomOutfit(CustomOutfitReviewRequest request, String clientApiKey) {
        if (request.getItemIds() == null || request.getItemIds().isEmpty()) {
            throw new IllegalArgumentException("At least one clothing item must be selected.");
        }

        List<ClothingItem> selectedItems = request.getItemIds().stream()
                .map(id -> clothingRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Clothing item with ID " + id + " was not found.")))
                .collect(Collectors.toList());

        String occasion = (request.getOccasion() != null && !request.getOccasion().trim().isEmpty())
                ? request.getOccasion().trim()
                : "CASUAL";

        WeatherDto weather = weatherService.getCurrentWeather(45.7537, 21.2257, request.getCity() != null ? request.getCity() : "Timisoara");
        if (request.getOverrideTemperature() != null) {
            weather.setTemperature(request.getOverrideTemperature());
            weather.setCold(request.getOverrideTemperature() < 14.0);
            weather.setHot(request.getOverrideTemperature() >= 25.0);
        }

        String weatherSummary = String.format("%.1f°C (%s)", weather.getTemperature(), weather.getCondition());
        AiOutfitAdviceResponse advice = geminiAiService.generateOutfitAdvice(occasion, weatherSummary, selectedItems, clientApiKey);

        String title = (request.getTitle() != null && !request.getTitle().trim().isEmpty())
                ? request.getTitle().trim()
                : advice.getTitle();

        return OutfitResponse.builder()
                .id(null)
                .name(title)
                .occasion(occasion)
                .weatherCondition(weatherSummary)
                .stylingAdvice(advice.getExplanation())
                .colorPalette(advice.getColorPalette())
                .stylingTips(advice.getStylingTips())
                .favorite(false)
                .items(selectedItems.stream().map(ClothingResponse::fromEntity).collect(Collectors.toList()))
                .createdAt(LocalDateTime.now())
                .build();
    }

    private void addItem(List<ClothingItem> list, ClothingItem item) {
        if (item != null && !list.contains(item)) {
            list.add(item);
        }
    }

    @Transactional
    public OutfitResponse saveOutfit(OutfitResponse draft) {
        return saveOutfit(draft, null);
    }

    @Transactional
    public OutfitResponse saveOutfit(OutfitResponse draft, com.smartwardrobe.auth.User user) {
        List<ClothingItem> items = draft.getItems().stream()
                .map(i -> clothingRepository.findById(i.getId()).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Outfit outfit = Outfit.builder()
                .user(user)
                .name(draft.getName())
                .occasion(draft.getOccasion())
                .weatherCondition(draft.getWeatherCondition())
                .stylingAdvice(draft.getStylingAdvice())
                .colorPalette(draft.getColorPalette())
                .favorite(draft.isFavorite())
                .items(items)
                .build();

        Outfit saved = outfitRepository.save(outfit);
        return OutfitResponse.fromEntity(saved);
    }

    public List<OutfitResponse> getAllSavedOutfits() {
        return getAllSavedOutfits(null);
    }

    public List<OutfitResponse> getAllSavedOutfits(com.smartwardrobe.auth.User user) {
        List<Outfit> list = (user != null)
                ? outfitRepository.findByUserOrderByCreatedAtDesc(user)
                : outfitRepository.findAllByOrderByCreatedAtDesc();

        return list.stream()
                .map(OutfitResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<OutfitResponse> getFavoriteOutfits() {
        return getFavoriteOutfits(null);
    }

    public List<OutfitResponse> getFavoriteOutfits(com.smartwardrobe.auth.User user) {
        List<Outfit> list = (user != null)
                ? outfitRepository.findByUserAndFavoriteTrue(user)
                : outfitRepository.findByFavoriteTrue();

        return list.stream()
                .map(OutfitResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public OutfitResponse toggleFavorite(Long id) {
        Outfit outfit = outfitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Outfit with ID " + id + " was not found."));
        outfit.setFavorite(!outfit.isFavorite());
        return OutfitResponse.fromEntity(outfitRepository.save(outfit));
    }

    @Transactional
    public void deleteOutfit(Long id) {
        if (!outfitRepository.existsById(id)) {
            throw new ResourceNotFoundException("Outfit with ID " + id + " was not found.");
        }
        outfitRepository.deleteById(id);
    }

    public boolean isWeatherAppropriate(ClothingItem item, WeatherDto weather) {
        if (weather == null) return true;
        int warmth = (item.getWarmthLevel() != null) ? item.getWarmthLevel() : 2;

        if (weather.isHot()) {
            // Temperature >= 25°C: No heavy outerwear
            return warmth <= 2 && item.getCategory() != ClothingCategory.OUTERWEAR;
        } else if (weather.isCold()) {
            // Temperature < 14°C: Require warmth >= 2 or layering tops/accessories
            return warmth >= 2 || item.getCategory() == ClothingCategory.TOPS || item.getCategory() == ClothingCategory.ACCESSORIES;
        }
        return true;
    }

    public ClothingItem pickBestCandidate(
            List<ClothingItem> items,
            String occasion,
            String targetStyle,
            WeatherDto weather,
            List<ClothingItem> alreadySelectedItems) {
        if (items == null || items.isEmpty()) return null;

        OutfitContext context = OutfitContext.builder()
                .occasion(occasion)
                .targetStyle(targetStyle)
                .weather(weather)
                .alreadySelectedItems(alreadySelectedItems != null ? alreadySelectedItems : Collections.emptyList())
                .build();

        Map<ClothingItem, Integer> scores = new HashMap<>();
        for (ClothingItem item : items) {
            scores.put(item, calculateItemScore(item, context));
        }

        int maxScore = scores.values().stream().max(Integer::compareTo).orElse(0);

        List<ClothingItem> topCandidates = items.stream()
                .filter(i -> scores.get(i) >= maxScore - 15)
                .collect(Collectors.toList());

        if (topCandidates.isEmpty()) {
            topCandidates = items;
        }

        return topCandidates.get(new Random().nextInt(topCandidates.size()));
    }

    public int calculateItemScore(ClothingItem item, OutfitContext context) {
        if (scoringRules == null || scoringRules.isEmpty()) {
            return 0;
        }
        return scoringRules.stream()
                .mapToInt(rule -> rule.score(item, context))
                .sum();
    }

    public String mapOccasionToStyle(String occasion) {
        if (occasion == null) return "CASUAL";
        String lower = occasion.toLowerCase();

        // Check Sporty & Athletic first (so "workout" is not caught by "work")
        if (lower.contains("sport") || lower.contains("gym") || lower.contains("active")
                || lower.contains("hiking") || lower.contains("workout") || lower.contains("yoga")
                || lower.contains("pilates") || lower.contains("run") || lower.contains("fitness")) {
            return "SPORTY";
        }

        if (lower.contains("wedding") || lower.contains("gala") || lower.contains("cocktail")
                || lower.contains("date") || lower.contains("romantic") || lower.contains("dinner")
                || lower.contains("party") || lower.contains("evening") || lower.contains("opera")
                || lower.contains("art") || lower.contains("gallery")) {
            return "ELEGANT";
        }

        if (lower.contains("work") || lower.contains("office") || lower.contains("meeting")
                || lower.contains("conference") || lower.contains("interview") || lower.contains("business")
                || lower.contains("presentation") || lower.contains("corporate") || lower.contains("keynote")) {
            return "OFFICE";
        }

        if (lower.contains("street") || lower.contains("festival") || lower.contains("concert")
                || lower.contains("skate") || lower.contains("club") || lower.contains("downtown")) {
            return "STREETWEAR";
        }

        return "CASUAL";
    }
}
