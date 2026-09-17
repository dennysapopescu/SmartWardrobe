# SmartWardrobe

AI-powered digital wardrobe and outfit recommendation platform.

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![OpenAPI 3](https://img.shields.io/badge/OpenAPI-3.0-85EA2D?style=flat-square&logo=swagger&logoColor=black)](http://localhost:8080/swagger-ui.html)
[![Tests](https://img.shields.io/badge/Tests-18%20Passing%20%7C%20JaCoCo-brightgreen?style=flat-square&logo=junit5&logoColor=white)](backend/src/test)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

[GitHub Repository](https://github.com/dennysapopescu/SmartWardrobe) · [API Documentation (Swagger UI)](http://localhost:8080/swagger-ui.html) · [Live Demo](#)

---

## Overview

SmartWardrobe is a full-stack application for digital wardrobe organization and context-aware outfit recommendations based on live meteorological data, occasion requirements, and visual garment analysis.

Algorithmic outfit recommendation requires balancing deterministic physical constraints (ambient temperature, weather conditions, dress codes) with stylistic harmony (color theory, silhouette balance). Rather than delegating the entire recommendation workflow to an unconstrained generative model—which frequently hallucinates impractical ensembles such as formal stilettos for workouts or light dresses in sub-zero weather—SmartWardrobe implements a **two-phase hybrid architecture**:

1. **Deterministic Rule & Scoring Engine:** Filters and scores wardrobe items against weather thresholds, occasion dress codes, style affinity, and color compatibility.
2. **Multimodal LLM Layer:** Leverages Google Gemini Vision for automated item categorization upon image upload and generates stylistic reasoning for the final assembled outfit.

---

## Features

- **Digital Closet Studio:** Categorized wardrobe browsing across Tops, Bottoms, Dresses, Outerwear, Footwear, and Accessories with real-time text search, category filters, and favorites.
- **Client-Side Image Segmentation:** Background removal executed directly in the browser via native HTML5 Canvas API prior to payload upload, reducing server load.
- **Multimodal AI Auto-Tagging:** Google Gemini Vision detects clothing category, subcategory, primary color, style, season, and warmth rating (1–5), backed by a local heuristic fallback simulator.
- **Context-Aware Recommendation Engine:** Pulls real-time meteorological forecasts via Open-Meteo to calibrate layer requirements and evaluate occasion constraints.
- **Extensible Scoring Strategy:** Uses modular scoring rules (`OccasionStyleRule`, `WeatherTemperatureRule`, `SportyFootwearRule`, `ColorHarmonyRule`) to select optimal candidates deterministically.
- **Color Compatibility Scoring:** Evaluates tonal balance and universal neutral pairings (e.g. Navy + White, Beige + Brown, Black + Red) before final selection.
- **Lookbook Persistence:** Save, review, and manage curated outfits in PostgreSQL.

---

## Architecture

### System Architecture

```
                  ┌──────────────────┐
                  │   React Client   │
                  │ TypeScript/Vite  │
                  └────────┬─────────┘
                           │ REST
                           ▼
                ┌──────────────────────┐
                │ Spring Boot Backend  │
                └──────────┬───────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
     PostgreSQL       Weather API       AI Service
    (Persistence)     (Open-Meteo)     (Google Gemini)
                                            │
                                            ▼
                                   Editorial Explanation
```

### Recommendation Pipeline

```
       Wardrobe Inventory
               │
               ▼
       Weather Filtering (Temperature thresholds & precipitation)
               │
               ▼
       Occasion Detection (Presets & custom text mapping)
               │
               ▼
       Style Compatibility Scoring (Modular rule strategies & penalties)
               │
               ▼
       Candidate Outfit Selection (Valid category layers assembled)
               │
               ▼
       Gemini Multimodal Reasoning (or Local heuristic fallback)
               │
               ▼
       Final Recommendation & Editorial Styling Advice
```

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3.3.4, Spring Data JPA, Hibernate 6, PostgreSQL 14, H2 (test profile) |
| **API & Validation** | Spring Validation (Bean Validation), RFC-7807 Exception Envelope (`@RestControllerAdvice`), OpenAPI 3 |
| **Frontend** | React 19, TypeScript 5, Vite 6, Tailwind CSS v4, Lucide React, HTML5 Canvas API |
| **Testing & Coverage** | JUnit 5, Mockito, Spring Test / MockMvc, JaCoCo Coverage Reporter |
| **External APIs** | Open-Meteo API (live meteorological forecasts), Google Gemini 1.5 Flash (vision & reasoning) |
| **DevOps & CI** | Docker, Docker Compose, Nginx, GitHub Actions |

---

## AI & Recommendation Engine

### Deterministic Rules vs. LLM Delegation

Generative models excel at synthesis and natural-language reasoning, but lack deterministic guarantees regarding physical feasibility. SmartWardrobe enforces strict separation of concerns:

- **Extensible Scoring Strategy (`OutfitScoringRule`):** Candidate scoring is decomposed into independent, testable rule strategies executed across candidate items:
  - `OccasionStyleRule`: Style affinity matrix matching styles (Sporty, Elegant, Office, Streetwear, Casual).
  - `SportyFootwearRule`: Disqualifies formal footwear (e.g. -300 penalty for stilettos on gym/yoga occasions) and prioritizes athletic trainers (+100).
  - `SportyApparelRule`: Rewards activewear (leggings, tanks, hoodies) and penalizes tailored trousers and silk blouses.
  - `WeatherTemperatureRule`: Evaluates ambient temperature (< 14°C mandates warmth and outerwear layering; >= 25°C eliminates heavy knitwear).
  - `ColorHarmonyRule`: Evaluates color compatibility between candidate garments and already selected items (e.g. White + Navy, Black + Red, Beige + Camel).

### Fallback Simulator & Resilience

If an external AI key is omitted or external services experience downtime, the backend seamlessly routes requests through an internal heuristic fallback simulator. This preserves core user workflows without hard external dependencies.

---

## API Documentation & Example

The REST API is documented via OpenAPI 3 / Swagger UI at `http://localhost:8080/swagger-ui.html`.

### Outfit Generation Endpoint

`POST /api/outfits/generate`

#### Request Payload:
```json
{
  "city": "Timisoara",
  "latitude": 45.75,
  "longitude": 21.23,
  "occasion": "Office Meeting",
  "overrideTemperature": 16.5
}
```

#### Response Payload (HTTP 200 OK):
```json
{
  "id": null,
  "name": "Refined Corporate Tailoring",
  "occasion": "Office Meeting",
  "weatherCondition": "16.5°C (Partly Cloudy)",
  "stylingAdvice": "Structured silhouette balancing professional office standards with comfortable mid-season layering.",
  "colorPalette": "Classic monochrome with camel accents",
  "stylingTips": [
    "Drape the wool coat unbuttoned over the silk blouse for an effortless layered aesthetic.",
    "Pair with leather loafers or block-heel pumps for all-day comfort."
  ],
  "favorite": false,
  "items": [
    {
      "id": 6,
      "name": "Silk Satin Evening Blouse",
      "category": "TOPS",
      "subCategory": "Button-Down",
      "style": "OFFICE",
      "primaryColor": "White",
      "warmthLevel": 2
    },
    {
      "id": 5,
      "name": "Tailored Pleated Trousers",
      "category": "BOTTOMS",
      "subCategory": "Dress Pants",
      "style": "OFFICE",
      "primaryColor": "Black",
      "warmthLevel": 3
    },
    {
      "id": 8,
      "name": "Wool Blend Tailored Longline Coat",
      "category": "OUTERWEAR",
      "subCategory": "Winter Coat",
      "style": "OFFICE",
      "primaryColor": "Camel",
      "warmthLevel": 5
    }
  ]
}
```

---

## Technical Decisions

- **Why React + Spring Boot?**  
  Spring Boot provides a robust, strongly-typed foundation with declarative transactions, mature ORM mapping, and standardized validation. React 19 with TypeScript delivers responsive client-side state handling and direct canvas manipulation for image segmentation.

- **Why Deterministic Scoring before Gemini?**  
  Outfit selection involves physical constraints (temperature, rain, category coverage) that must be testable and predictable. The deterministic engine guarantees feasibility first, leaving styling commentary to the LLM.

- **Why Client-Side Image Processing?**  
  Executing garment background removal in-browser via the HTML5 Canvas API offloads heavy image processing from backend instances, eliminates external segmentation API subscription costs, and guarantees user image privacy.

- **Why PostgreSQL?**  
  PostgreSQL provides relational consistency for wardrobe collections, outfit associations, and enum-mapped category queries, while allowing straightforward containerized local deployment and cloud migration.

- **Why Docker?**  
  Containerizing the multi-service architecture (PostgreSQL, Spring Boot backend, React/Nginx frontend) ensures parity between local development, CI pipelines, and production deployments in one command.

- **Why Open-Meteo?**  
  Open-Meteo offers high-precision global weather forecasts with hourly temperature and precipitation data without proprietary API key requirements or rate limit constraints for standard usage.

---

## Running Locally

### Option 1: Docker Compose (Recommended)

1. Clone the repository and configure the environment:
   ```bash
   git clone https://github.com/dennysapopescu/SmartWardrobe.git
   cd SmartWardrobe
   cp .env.example .env
   ```
2. Build and run containers:
   ```bash
   docker compose up --build
   ```
3. Access points:
   - **Frontend UI:** [http://localhost:5173](http://localhost:5173) (or port 80)
   - **Backend API:** [http://localhost:8080](http://localhost:8080)
   - **Swagger Docs:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   - **PostgreSQL:** `localhost:5432`

---

### Option 2: Local Development

Prerequisites: Java 17+, Node.js 20+, local PostgreSQL 14 instance.

1. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Customize .env with your local credentials
   ```

2. **One-Click Startup:**
   ```bash
   ./start.sh
   ```
   *(Sources `.env`, clears occupied ports, launches Spring Boot and Vite dev servers, and cleans up on `Ctrl+C`).*

3. **IntelliJ IDEA:**
   Run configurations are available in `.idea/runConfigurations/` for one-click startup and breakpoint debugging.

---

## Testing

The backend includes unit tests for scoring rules, integration tests with MockMvc, and Spring context verification with JaCoCo coverage reporting:

```bash
cd backend
./mvnw clean test
```

Coverage report generated at `backend/target/site/jacoco/index.html`.

### Test Suite Highlights:
- **`OutfitRecommendationServiceTest` (9 tests):** Validates style affinity, cold weather outerwear triggering (< 18°C), hot weather coat exclusions (> 25°C), sport occasion dress exclusion, locked items preservation, and deterministic scoring.
- **`OutfitScoringRulesTest` (5 tests):** Unit tests for `OccasionStyleRule`, `SportyFootwearRule`, `SportyApparelRule`, `WeatherTemperatureRule`, and `ColorHarmonyRule`.
- **`ClothingControllerTest` (3 tests):** Validates HTTP 200 listings, HTTP 404 with structured `ApiErrorResponse` envelope, and HTTP 400 validation error handling.
- **`SmartWardrobeApplicationTests` (1 test):** Full application context load verification backed by an isolated H2 in-memory profile.

---

## Screenshots

### Digital Closet
![Digital Closet](docs/screenshots/closet.png)

### AI Outfit Generator
![Outfit Generator](docs/screenshots/outfit-generator.png)

### Lookbook
![Lookbook](docs/screenshots/lookbook.png)

*(Screenshots can be added to `docs/screenshots/`)*

---

## Current Limitations

- **AI Service Availability:** Multimodal tagging relies on Google Gemini availability; when unconfigured, the built-in heuristic simulator is used.
- **Rule-Based Compatibility:** Outfit compatibility is currently rule-based rather than personalized from historical user preferences or feedback loops.
- **Single-User Scope:** Multi-tenant user authentication (JWT/OAuth2) is not currently implemented.
- **Local Media Storage:** Uploaded image files are stored on local/container disk storage rather than cloud object storage (e.g. S3).

---

## Future Improvements

- Authentication & authorization with Spring Security and JWT.
- Cloud object storage adapter (Amazon S3 / Google Cloud Storage) for uploaded garments.
- Observability and metrics endpoint integration with Spring Boot Actuator and Prometheus.
- Learning user preferences from outfit acceptance/rejection history.

---

## License

This project is licensed under the terms of the [MIT License](LICENSE).
