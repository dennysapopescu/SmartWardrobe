package com.smartwardrobe.outfit;

import com.smartwardrobe.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OutfitRepository extends JpaRepository<Outfit, Long> {

    // User-scoped queries
    List<Outfit> findByUserOrderByCreatedAtDesc(User user);
    List<Outfit> findByUserAndFavoriteTrue(User user);
    Optional<Outfit> findByIdAndUser(Long id, User user);

    // Fallback global queries
    List<Outfit> findByFavoriteTrue();
    List<Outfit> findByOccasionIgnoreCase(String occasion);
    List<Outfit> findAllByOrderByCreatedAtDesc();
}
