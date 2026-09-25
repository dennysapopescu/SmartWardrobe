# SmartWardrobe

AI-powered digital wardrobe and outfit recommendation platform.

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6%20%7C%20JWT-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)](backend/src/main/java/com/smartwardrobe/auth)
[![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0202?style=flat-square&logo=flyway&logoColor=white)](backend/src/main/resources/db/migration)
[![Actuator](https://img.shields.io/badge/Actuator-Health_&_Metrics-6DB33F?style=flat-square&logo=spring&logoColor=white)](http://localhost:8080/actuator/health)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![OpenAPI 3](https://img.shields.io/badge/OpenAPI-3.0-85EA2D?style=flat-square&logo=swagger&logoColor=black)](http://localhost:8080/swagger-ui.html)
[![Tests](https://img.shields.io/badge/Tests-24%20Passing%20%7C%20JaCoCo-brightgreen?style=flat-square&logo=junit5&logoColor=white)](backend/src/test)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

[GitHub Repository](https://github.com/dennysapopescu/SmartWardrobe) · [API Documentation (Swagger UI)](http://localhost:8080/swagger-ui.html) · [Actuator Health](http://localhost:8080/actuator/health)

---

## Overview

SmartWardrobe is an enterprise-grade full-stack application for digital wardrobe organization and context-aware outfit recommendations based on live meteorological data, occasion requirements, and visual garment analysis.

Algorithmic outfit recommendation requires balancing deterministic physical constraints (ambient temperature, weather conditions, dress codes) with stylistic harmony (color theory, silhouette balance). Rather than delegating the entire recommendation workflow to an unconstrained generative model—which frequently hallucinates impractical ensembles such as formal stilettos for workouts or light dresses in sub-zero weather—SmartWardrobe implements a **two-phase hybrid architecture**:

1. **Deterministic Rule & Scoring Engine:** Filters and scores wardrobe items against weather thresholds, occasion dress codes, style affinity, and color compatibility.
2. **Multimodal LLM Layer:** Leverages Google Gemini Vision for automated item categorization upon image upload and generates stylistic reasoning for the final assembled outfit.

---

## Key Features

- **Multi-Tenant User Isolation & JWT Authentication:** Complete authentication lifecycle (Register, Login, BCrypt password hashing, stateless JWT Bearer tokens). Each user owns a private digital wardrobe and lookbook with strict tenant isolation.
- **⚡ Instant One-Click Demo Mode:** Recruiter-ready, zero-friction evaluation. Allows immediate full exploration of 22 curated capsule items and AI recommendations without mandatory registration.
- **Database Migrations with Flyway:** Version-controlled database evolutions (`V1__init_schema.sql`, `V2__seed_demo_data.sql`), replacing unmanaged `ddl-auto: update` with production-grade validation (`ddl-auto: validate`).
- **Observability & Health Checks (Spring Boot Actuator):** Exposed endpoints at `/actuator/health`, `/actuator/info`, and `/actuator/metrics`. Includes a custom `SmartWardrobeHealthIndicator` monitoring active clothes count, registered users, and Gemini AI connectivity.
- **Server-Side Pagination & Filtering:** Spring Data `Pageable` with responsive UI pagination controls (Page X of Y, direct page selection, debounced full-text search, and category pills).
- **Digital Closet Studio:** Categorized wardrobe browsing across Tops, Bottoms, Dresses, Outerwear, Footwear, and Accessories with real-time text search, category filters, and favorites.
- **Client-Side Image Segmentation:** Background removal executed directly in the browser via native HTML5 Canvas API prior to payload upload, reducing server load.
- **Multimodal AI Auto-Tagging:** Google Gemini Vision detects clothing category, subcategory, primary color, style, season, and warmth rating (1–5), backed by a local heuristic fallback simulator.
- **Context-Aware Recommendation Engine:** Pulls real-time meteorological forecasts via Open-Meteo to calibrate layer requirements and evaluate occasion constraints.
- **Extensible Scoring Strategy:** Uses modular scoring rules (`OccasionStyleRule`, `WeatherTemperatureRule`, `SportyFootwearRule`, `ColorHarmonyRule`) to select optimal candidates deterministically.
- **Color Compatibility Scoring:** Evaluates tonal balance and universal neutral pairings (e.g. Navy + White, Beige + Brown, Black + Red) before final selection.
- **Interactive Custom Outfit Studio ("Create My Own"):** Assemble personalized outfits piece-by-piece from wardrobe items with slot management, live warmth and palette tracking, optional AI stylist review, and one-click saving to Lookbook.
- **Pinterest-Style Editorial Flat Lay Moodboard:** Automatically generates a high-fashion flat lay collage on a pure white studio background with organic drop shadows, typography, color harmony dots, and one-click 1200x1500px PNG export.
- **Lookbook Persistence:** Save, review, and manage curated outfits in PostgreSQL.

---

## Architecture

### System Architecture

```
                  ┌──────────────────┐
                  │   React Client   │
                  │ (TypeScript/Vite)│
                  └────────┬─────────┘
                           │ REST (JWT Bearer)
                           ▼
                ┌──────────────────────┐
                │ Spring Boot Backend  │
                │(Security 6 + Actuator)│
                └──────────┬───────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
     PostgreSQL       Weather API       AI Service
    (Flyway V1/V2)    (Open-Meteo)     (Google Gemini)
                                            │
                                            ▼
                                   Editorial Explanation
```

### Recommendation Pipeline

```
       User's Wardrobe Inventory
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
| **Security & Auth** | Spring Security 6, JJWT 0.12.6, BCrypt Password Hashing, Stateless JWT Bearer Filter |
| **Database Migrations** | Flyway 10 (`V1__init_schema.sql`, `V2__seed_demo_data.sql`), `ddl-auto: validate` |
| **Observability** | Spring Boot Actuator (`/actuator/health`, `/actuator/metrics`), Custom `SmartWardrobeHealthIndicator` |
| **API & Validation** | Spring Validation (Bean Validation), RFC-7807 Exception Envelope (`@RestControllerAdvice`), OpenAPI 3 |
| **Frontend** | React 19, TypeScript 5, Vite 6, Tailwind CSS v4, Lucide React, HTML5 Canvas API |
| **Testing & Coverage** | JUnit 5, Mockito, Spring Security Test, MockMvc, JaCoCo Coverage Reporter |
| **External APIs** | Open-Meteo API (live meteorological forecasts), Google Gemini 1.5 Flash (vision & reasoning) |
| **DevOps & CI** | Docker, Docker Compose, Nginx, GitHub Actions |

---

## Observability & Health Checks

SmartWardrobe integrates Spring Boot Actuator for health monitoring and operational metrics:

- **Health Status:** `GET /actuator/health`
- **Application Metrics:** `GET /actuator/metrics`
- **Custom Health Indicator:** `SmartWardrobeHealthIndicator` provides real-time counts of cataloged clothing items, registered user accounts, and AI integration status:

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP", "details": { "database": "PostgreSQL", "validationQuery": "isValid()" } },
    "diskSpace": { "status": "UP" },
    "ping": { "status": "UP" },
    "smartWardrobe": {
      "status": "UP",
      "details": {
        "totalClothingItems": 22,
        "totalUsers": 1,
        "aiConfigured": true,
        "aiModel": "gemini-1.5-flash"
      }
    }
  }
}
```

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
   - **Actuator Health:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
   - **PostgreSQL:** `localhost:5432`

---

### Option 2: Local Development

Prerequisites: Java 17+, Node.js 20+, local PostgreSQL 14 instance (or zero-config H2 fallback).

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

---

## Testing

The backend includes 24 automated unit and integration tests with JaCoCo coverage reporting:

```bash
cd backend
./mvnw clean test
```

Coverage report generated at `backend/target/site/jacoco/index.html`.

### Test Suite Highlights (24 Tests Passing):
- **`AuthControllerTest` (3 tests):** Validates user registration, JWT login authentication, and instant one-click demo token issuance.
- **`ClothingControllerTest` (4 tests):** Validates authenticated user-scoped paginated queries, favorite toggling, and structured `ApiErrorResponse` validation envelopes.
- **`OutfitRecommendationServiceTest` (11 tests):** Validates style affinity, cold weather outerwear triggering (< 18°C), hot weather coat exclusions (> 25°C), sport occasion dress exclusion, locked items preservation, and deterministic scoring.
- **`OutfitScoringRulesTest` (5 tests):** Unit tests for `OccasionStyleRule`, `SportyFootwearRule`, `SportyApparelRule`, `WeatherTemperatureRule`, and `ColorHarmonyRule`.
- **`SmartWardrobeApplicationTests` (1 test):** Full application context and Flyway migration verification backed by an isolated H2 in-memory test database.

---

## License

This project is licensed under the terms of the [MIT License](LICENSE).
