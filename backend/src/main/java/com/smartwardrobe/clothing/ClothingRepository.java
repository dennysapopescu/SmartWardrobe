package com.smartwardrobe.clothing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClothingRepository extends JpaRepository<ClothingItem, Long> {

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
