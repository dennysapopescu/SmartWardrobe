package com.smartwardrobe.auth.dto;

import com.smartwardrobe.auth.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private LocalDateTime createdAt;
}
