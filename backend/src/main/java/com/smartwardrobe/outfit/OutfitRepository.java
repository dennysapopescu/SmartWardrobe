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

    @org.springframework.transaction.annotation.Transactional
    void deleteByUser(User user);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM outfit_items WHERE clothing_item_id = :itemId", nativeQuery = true)
    void deleteOutfitItemAssociations(@org.springframework.data.repository.query.Param("itemId") Long itemId);

    // Fallback global queries
    List<Outfit> findByFavoriteTrue();
    List<Outfit> findByOccasionIgnoreCase(String occasion);
    List<Outfit> findAllByOrderByCreatedAtDesc();
}
