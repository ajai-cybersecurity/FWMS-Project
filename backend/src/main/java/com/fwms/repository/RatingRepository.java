package com.fwms.repository;

import com.fwms.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByRatedId(Long ratedId);
    List<Rating> findByRaterId(Long raterId);

    Optional<Rating> findByTaskIdAndRaterId(Long taskId, Long raterId);

    boolean existsByTaskIdAndRaterId(Long taskId, Long raterId);

    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.ratedId = :ratedId")
    Double avgStarsByRatedId(Long ratedId);

    List<Rating> findByTaskId(Long taskId);
}
