package com.smartwardrobe.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartWardrobeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart Wardrobe API")
                        .description("AI-Powered Capsule Wardrobe, Multimodal Vision Auto-Tagging, Real-Time Weather Adaptation & Contextual Outfit Recommendation Engine")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Dennysa • Smart Wardrobe")
                                .url("https://github.com/dennysa/SmartWardrobe"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
