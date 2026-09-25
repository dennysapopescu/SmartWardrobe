package com.smartwardrobe.clothing;

import com.smartwardrobe.auth.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClothingRepository extends JpaRepository<ClothingItem, Long> {

    // User-scoped queries with Pageable pagination
    Page<ClothingItem> findByUser(User user, Pageable pageable);

    Page<ClothingItem> findByUserAndCategory(User user, ClothingCategory category, Pageable pageable);

    Page<ClothingItem> findByUserAndFavoriteTrue(User user, Pageable pageable);

    @Query("SELECT c FROM ClothingItem c WHERE c.user = :user AND (" +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.primaryColor) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.subCategory) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<ClothingItem> searchUserItems(@Param("user") User user, @Param("query") String query, Pageable pageable);

    // User-scoped unpaginated queries (for outfit generator and studio canvas)
    List<ClothingItem> findByUser(User user);

    List<ClothingItem> findByUserAndCategory(User user, ClothingCategory category);

    List<ClothingItem> findByUserAndFavoriteTrue(User user);

    Optional<ClothingItem> findByIdAndUser(Long id, User user);

    long countByUser(User user);

    @org.springframework.transaction.annotation.Transactional
    void deleteByUser(User user);

    // Global / fallback queries
    List<ClothingItem> findByCategory(ClothingCategory category);

    List<ClothingItem> findByCategoryIn(List<ClothingCategory> categories);

    List<ClothingItem> findByFavoriteTrue();

    @Query("SELECT c FROM ClothingItem c WHERE c.season IN :seasons OR c.season = 'ALL_SEASON'")
    List<ClothingItem> findByApplicableSeasons(@Param("seasons") List<String> seasons);

    @Query("SELECT c FROM ClothingItem c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.primaryColor) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.subCategory) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ClothingItem> searchItems(@Param("query") String query);
}
