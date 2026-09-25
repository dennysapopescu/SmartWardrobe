package com.smartwardrobe.clothing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwardrobe.clothing.dto.ClothingResponse;
import com.smartwardrobe.common.FileStorageService;
import com.smartwardrobe.common.dto.PageResponse;
import com.smartwardrobe.common.exception.GlobalExceptionHandler;
import com.smartwardrobe.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClothingController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("h2")
@Import(GlobalExceptionHandler.class)
class ClothingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClothingService clothingService;

    @MockBean
    private FileStorageService fileStorageService;

    @MockBean
    private com.smartwardrobe.auth.UserRepository userRepository;

    @MockBean
    private com.smartwardrobe.auth.JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/clothes returns 200 and paginated clothing items")
    void testGetClothesPaginated_Returns200() throws Exception {
        ClothingResponse item = ClothingResponse.builder()
                .id(1L)
                .name("Classic White Poplin Shirt")
                .category(ClothingCategory.TOPS)
                .subCategory("Shirt")
                .primaryColor("White")
                .style("OFFICE")
                .season("ALL_SEASON")
                .warmthLevel(2)
                .favorite(true)
                .build();

        PageResponse<ClothingResponse> page = PageResponse.<ClothingResponse>builder()
                .content(List.of(item))
                .pageNumber(0)
                .pageSize(12)
                .totalElements(1)
                .totalPages(1)
                .isFirst(true)
                .isLast(true)
                .build();

        when(clothingService.getClothesPaginated(any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/clothes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content[0].name").value("Classic White Poplin Shirt"))
                .andExpect(jsonPath("$.content[0].category").value("TOPS"))
                .andExpect(jsonPath("$.content[0].primaryColor").value("White"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/clothes/all returns 200 and unpaginated list of items")
    void testGetAllClothes_Returns200() throws Exception {
        ClothingResponse item = ClothingResponse.builder()
                .id(1L)
                .name("Classic White Poplin Shirt")
                .category(ClothingCategory.TOPS)
                .subCategory("Shirt")
                .primaryColor("White")
                .style("OFFICE")
                .season("ALL_SEASON")
                .warmthLevel(2)
                .favorite(true)
                .build();

        when(clothingService.getAllItems(any())).thenReturn(List.of(item));

        mockMvc.perform(get("/api/clothes/all"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].name").value("Classic White Poplin Shirt"));
    }

    @Test
    @DisplayName("GET /api/clothes/{id} returns 404 with standardized ApiErrorResponse when item not found")
    void testGetClothingById_NotFound_Returns404() throws Exception {
        when(clothingService.getItemById(eq(999L)))
                .thenThrow(new ResourceNotFoundException("Clothing item with ID 999 was not found."));

        mockMvc.perform(get("/api/clothes/999"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Clothing item with ID 999 was not found."))
                .andExpect(jsonPath("$.path").value("/api/clothes/999"));
    }

    @Test
    @DisplayName("POST /api/clothes returns 400 Bad Request with field validation errors when name is blank")
    void testCreateClothingItem_ValidationFailure_Returns400() throws Exception {
        String invalidPayload = """
                {
                    "name": "",
                    "category": "TOPS",
                    "primaryColor": "White"
                }
                """;

        mockMvc.perform(post("/api/clothes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }
}
