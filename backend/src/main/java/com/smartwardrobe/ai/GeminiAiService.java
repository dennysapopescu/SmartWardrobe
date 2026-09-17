package com.smartwardrobe.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartwardrobe.ai.dto.AiOutfitAdviceResponse;
import com.smartwardrobe.ai.dto.AiTaggingResponse;
import com.smartwardrobe.clothing.ClothingCategory;
import com.smartwardrobe.clothing.ClothingItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.*;

@Service
@Slf4j
public class GeminiAiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String configuredApiKey;
    private final String model;

    public GeminiAiService(
            RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper,
            @Value("${app.ai.gemini.api-key:}") String configuredApiKey,
            @Value("${app.ai.gemini.model:gemini-1.5-flash}") String model
    ) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(20))
                .build();
        this.objectMapper = objectMapper;
        this.configuredApiKey = configuredApiKey != null ? configuredApiKey.trim() : "";
        this.model = model;
    }

    public AiTaggingResponse analyzeClothingImage(MultipartFile file, byte[] rawBytes, String clientApiKey) {
        String activeApiKey = resolveApiKey(clientApiKey);

        if (!activeApiKey.isEmpty()) {
            try {
                byte[] imageBytes = (file != null && !file.isEmpty()) ? file.getBytes() : rawBytes;
                if (imageBytes != null && imageBytes.length > 0) {
                    String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                    String mimeType = (file != null && file.getContentType() != null) ? file.getContentType() : "image/png";

                    return callGeminiVision(base64Image, mimeType, activeApiKey);
                }
            } catch (Exception e) {
                log.warn("Gemini Vision API call failed ({}), falling back to intelligent heuristic simulator: {}", e.getClass().getSimpleName(), e.getMessage());
            }
        }

        // Fallback: Smart Heuristic Simulator in English (100% free, zero external dependency)
        return generateSmartMockTagging(file != null ? file.getOriginalFilename() : "clothing.png");
    }

    public AiOutfitAdviceResponse generateOutfitAdvice(
            String occasion,
            String weatherSummary,
            List<ClothingItem> outfitItems,
            String clientApiKey
    ) {
        String activeApiKey = resolveApiKey(clientApiKey);

        if (!activeApiKey.isEmpty() && outfitItems != null && !outfitItems.isEmpty()) {
            try {
                return callGeminiOutfitStyling(occasion, weatherSummary, outfitItems, activeApiKey);
            } catch (Exception e) {
                log.warn("Gemini Outfit Styling API call failed, falling back to rule-based stylist: {}", e.getMessage());
            }
        }

        return generateSmartMockAdvice(occasion, weatherSummary, outfitItems);
    }

    private String resolveApiKey(String clientApiKey) {
        if (clientApiKey != null && !clientApiKey.trim().isEmpty()) {
            return clientApiKey.trim();
        }
        return this.configuredApiKey;
    }

    private AiTaggingResponse callGeminiVision(String base64Image, String mimeType, String apiKey) throws Exception {
        String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey
        );

        String prompt = "You are a luxury fashion stylist AI. Analyze this clothing item image. " +
                "Respond ONLY with a JSON object in this exact schema without markdown code blocks:\n" +
                "{\n" +
                "  \"name\": \"Short descriptive fashion title in English (e.g. Oversized Linen Blazer)\",\n" +
                "  \"category\": \"TOPS|BOTTOMS|DRESSES|OUTERWEAR|SHOES|ACCESSORIES\",\n" +
                "  \"subCategory\": \"Specific item type in English (e.g. Blazer, Trench Coat, Mom Jeans, Slip Dress, Loafers)\",\n" +
                "  \"primaryColor\": \"Dominant color in English (e.g. Beige, Black, White, Navy, Camel)\",\n" +
                "  \"secondaryColor\": \"Accent color or null\",\n" +
                "  \"pattern\": \"Solid|Striped|Floral|Plaid|Graphic|Animal Print\",\n" +
                "  \"style\": \"CASUAL|OFFICE|ELEGANT|STREETWEAR|PARTY|SPORTY\",\n" +
                "  \"season\": \"SPRING|SUMMER|FALL|WINTER|ALL_SEASON\",\n" +
                "  \"warmthLevel\": 1 to 5 integer,\n" +
                "  \"analysisNotes\": \"1-2 sentences fashion analysis in English explaining the silhouette and versatile styling advice\"\n" +
                "}";

        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contents = requestBody.putArray("contents");
        ObjectNode contentObj = contents.addObject();
        ArrayNode parts = contentObj.putArray("parts");

        parts.addObject().put("text", prompt);

        ObjectNode inlineData = parts.addObject().putObject("inline_data");
        inlineData.put("mime_type", mimeType);
        inlineData.put("data", base64Image);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            String cleanJson = text.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode parsed = objectMapper.readTree(cleanJson);

            ClothingCategory category = ClothingCategory.valueOf(
                    parsed.path("category").asText("TOPS").toUpperCase()
            );

            return AiTaggingResponse.builder()
                    .name(parsed.path("name").asText("Fashion Item"))
                    .category(category)
                    .subCategory(parsed.path("subCategory").asText("Essential"))
                    .primaryColor(parsed.path("primaryColor").asText("Neutral"))
                    .secondaryColor(parsed.path("secondaryColor").asText(null))
                    .pattern(parsed.path("pattern").asText("Solid"))
                    .style(parsed.path("style").asText("CASUAL").toUpperCase())
                    .season(parsed.path("season").asText("ALL_SEASON").toUpperCase())
                    .warmthLevel(parsed.path("warmthLevel").asInt(2))
                    .analysisNotes(parsed.path("analysisNotes").asText("Successfully detected using Gemini Vision AI."))
                    .simulated(false)
                    .build();
        }

        throw new RuntimeException("Empty response from Gemini API");
    }

    private AiOutfitAdviceResponse callGeminiOutfitStyling(
            String occasion,
            String weatherSummary,
            List<ClothingItem> items,
            String apiKey
    ) throws Exception {
        String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey
        );

        StringBuilder sb = new StringBuilder();
        for (ClothingItem item : items) {
            sb.append("- ").append(item.getCategory()).append(": ")
                    .append(item.getName()).append(" (")
                    .append(item.getPrimaryColor()).append(", ")
                    .append(item.getStyle()).append(")\n");
        }

        String prompt = "You are a high-fashion personal stylist. " +
                "Evaluate this outfit composed of:\n" + sb +
                "Context: Occasion: " + occasion + ", Weather: " + weatherSummary + ".\n" +
                "Respond ONLY with a valid JSON without markdown in this schema:\n" +
                "{\n" +
                "  \"title\": \"Catchy outfit title in English (e.g. Parisian Chic on a Sunny Afternoon)\",\n" +
                "  \"explanation\": \"Styling explanation in English why this outfit works harmoniously in color theory and proportion for this context\",\n" +
                "  \"colorPalette\": \"e.g. Warm neutral tones with contrasting accent\",\n" +
                "  \"stylingTips\": [\"Pro tip 1 in English\", \"Pro tip 2 in English\"]\n" +
                "}";

        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contents = requestBody.putArray("contents");
        ObjectNode contentObj = contents.addObject();
        ArrayNode parts = contentObj.putArray("parts");
        parts.addObject().put("text", prompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            String cleanJson = text.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode parsed = objectMapper.readTree(cleanJson);

            List<String> tips = new ArrayList<>();
            if (parsed.has("stylingTips")) {
                parsed.path("stylingTips").forEach(node -> tips.add(node.asText()));
            }

            return AiOutfitAdviceResponse.builder()
                    .title(parsed.path("title").asText("Curated Outfit"))
                    .explanation(parsed.path("explanation").asText("Harmonious combination tailored to your occasion."))
                    .colorPalette(parsed.path("colorPalette").asText("Modern tonal harmony"))
                    .stylingTips(tips)
                    .simulated(false)
                    .build();
        }

        throw new RuntimeException("Empty response from Gemini Styling API");
    }

    private AiTaggingResponse generateSmartMockTagging(String filename) {
        String lower = filename.toLowerCase();

        ClothingCategory category = ClothingCategory.TOPS;
        String name = "Minimalist Cotton Top";
        String subCategory = "T-Shirt";
        String color = "Crisp White";
        String style = "CASUAL";
        String season = "ALL_SEASON";
        int warmth = 2;

        if (lower.contains("pant") || lower.contains("jean") || lower.contains("denim") || lower.contains("skirt") || lower.contains("trouser") || lower.contains("fust")) {
            category = ClothingCategory.BOTTOMS;
            name = "Tailored Straight Pants";
            subCategory = lower.contains("jean") ? "Straight Denim" : "Tailored Trousers";
            color = "Navy Blue";
            warmth = 3;
        } else if (lower.contains("dress") || lower.contains("rochie")) {
            category = ClothingCategory.DRESSES;
            name = "Silk Slip Midi Dress";
            subCategory = "Slip Dress";
            color = "Emerald Green";
            style = "ELEGANT";
            season = "SPRING";
            warmth = 2;
        } else if (lower.contains("coat") || lower.contains("sacou") || lower.contains("blazer") || lower.contains("jacket") || lower.contains("trench")) {
            category = ClothingCategory.OUTERWEAR;
            name = "Structured Oversized Blazer";
            subCategory = "Blazer";
            color = "Camel Beige";
            style = "OFFICE";
            warmth = 3;
        } else if (lower.contains("shoe") || lower.contains("pantof") || lower.contains("sneaker") || lower.contains("boot") || lower.contains("heel")) {
            category = ClothingCategory.SHOES;
            name = "Minimalist Leather Low-Top Sneakers";
            subCategory = "Leather Sneakers";
            color = "Crisp White";
            style = "STREETWEAR";
            warmth = 2;
        } else if (lower.contains("bag") || lower.contains("belt") || lower.contains("scarf") || lower.contains("sunglass")) {
            category = ClothingCategory.ACCESSORIES;
            name = "Structured Leather Shoulder Bag";
            subCategory = "Crossbody Bag";
            color = "Cognac Brown";
            style = "ELEGANT";
            warmth = 1;
        }

        return AiTaggingResponse.builder()
                .name(name)
                .category(category)
                .subCategory(subCategory)
                .primaryColor(color)
                .secondaryColor("Neutral")
                .pattern("Solid")
                .style(style)
                .season(season)
                .warmthLevel(warmth)
                .analysisNotes("Automatically identified using Fashion AI Simulator. (Optional: Add your free Google Gemini API key in Settings for live vision recognition).")
                .simulated(true)
                .build();
    }

    private AiOutfitAdviceResponse generateSmartMockAdvice(
            String occasion,
            String weatherSummary,
            List<ClothingItem> items
    ) {
        String occ = (occasion != null) ? occasion.toLowerCase() : "casual";
        String title;
        String explanation;
        List<String> tips = new ArrayList<>();

        if (occ.contains("wedding") || occ.contains("gala") || occ.contains("nunta")) {
            title = "Refined Black-Tie & Ceremony Grace";
            explanation = "An impeccably tailored, graceful silhouette designed for celebratory elegance. The clean lines and elevated tones harmoniously respect formal occasion etiquette.";
            tips.add("Keep accessories refined and intentional—a sleek clutch and fine jewelry.");
            tips.add("Opt for sophisticated footwear with subtle luster.");
        } else if (occ.contains("art") || occ.contains("gallery") || occ.contains("exhibition")) {
            title = "Curator's Avant-Garde Minimal";
            explanation = "An artistic, high-fashion statement playing with architectural proportions and tonal texture depth. Creative, sharp, and culturally resonant.";
            tips.add("Add a sculptural accessory or statement ring for an artistic conversation starter.");
            tips.add("Pair with minimalist leather boots or architectural mules.");
        } else if (occ.contains("conference") || occ.contains("pitch") || occ.contains("keynote") || occ.contains("business") || occ.contains("office") || occ.contains("birou") || occ.contains("interview")) {
            title = "Executive Presence & Keynote Poise";
            explanation = "A balanced interplay between authoritative structure and contemporary ease. The crisp tailored silhouette commands respect while staying approachable.";
            tips.add("Pair with a structured leather tote for a polished executive silhouette.");
            tips.add("Keep jewelry sleek with minimalist gold or silver accents.");
        } else if (occ.contains("travel") || occ.contains("airport") || occ.contains("vacation") || occ.contains("flight")) {
            title = "Jet-Set First Class Chic";
            explanation = "The ultimate balance between luxurious comfort and elevated travel style. Breathable layers ensure effortless elegance from lounge to destination.";
            tips.add("Layer with a soft knit or trench coat for cabin temperature fluctuations.");
            tips.add("Slip on premium leather loafers or clean luxury sneakers.");
        } else if (occ.contains("cocktail") || occ.contains("rooftop") || occ.contains("lounge") || occ.contains("drinks")) {
            title = "Golden Hour Rooftop Lounge";
            explanation = "A sultry blend of sleek silhouettes and rich textures crafted for evening golden hour cocktails and sunset ambiance.";
            tips.add("Highlight with warm metallic jewelry and a minimalist clutch.");
            tips.add("Opt for an open-toe mule or refined stiletto.");
        } else if (occ.contains("date") || occ.contains("romantic") || occ.contains("dinner")) {
            title = "Effortless Romance";
            explanation = "A fluid and evocative composition. The tactile contrast between soft draping and structured tailoring creates an elongated, magnetic silhouette.";
            tips.add("Mist your favorite fragrance over pulse points.");
            tips.add("Accentuate with subtle luminous makeup and a bold lip.");
        } else if (occ.contains("brunch") || occ.contains("weekend") || occ.contains("friends")) {
            title = "Urban Parisian Brunch";
            explanation = "Relaxed, photogenic, and effortlessly chic. The tones complement each other seamlessly for weekend coffee and casual strolls.";
            tips.add("Complete the look with tortoiseshell or cat-eye sunglasses.");
            tips.add("Wear your bag crossbody for hands-free effortless styling.");
        } else if (occ.contains("party") || occ.contains("glam") || occ.contains("club") || occ.contains("festival") || occ.contains("seara")) {
            title = "Cocktail Hour Sophistication";
            explanation = "An alluring balance of clean lines and glamorous flair designed to transition seamlessly into late evening celebrations.";
            tips.add("Elevate with metallic heeled sandals and a clutch.");
            tips.add("Layer a sharp blazer over your shoulders for modern drama.");
        } else if (occ.contains("sport") || occ.contains("gym") || occ.contains("active") || occ.contains("hiking") || occ.contains("workout") || occ.contains("yoga")) {
            title = "Elevated Athleisure Performance";
            explanation = "Streamlined, high-performance styling combining ergonomic comfort with modern street-level aesthetics.";
            tips.add("Style with sleek running shoes and a monochrome baseball cap.");
            tips.add("Bring along an insulated stainless steel water bottle.");
        } else {
            title = (occasion != null && !occasion.isBlank()) ? "Curated: " + occasion : "Contemporary Daily Minimal";
            explanation = "Built around capsule wardrobe excellence: timeless cuts, premium textures, and effortless all-day adaptability for your " + ((occasion != null && !occasion.isBlank()) ? occasion : "day") + ".";
            tips.add("Cuff the sleeves slightly for an effortless, undone aesthetic.");
            tips.add("Stick to a cohesive neutral hardware color palette.");
        }

        return AiOutfitAdviceResponse.builder()
                .title(title)
                .explanation(explanation + " Specially calibrated for: " + weatherSummary + ".")
                .colorPalette("Tonal neutral balance with sophisticated accents")
                .stylingTips(tips)
                .simulated(true)
                .build();
    }
}
