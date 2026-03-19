package com.fwms.controller;

import com.fwms.model.Rating;
import com.fwms.model.Task;
import com.fwms.model.User;
import com.fwms.repository.RatingRepository;
import com.fwms.repository.TaskRepository;
import com.fwms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingRepository ratingRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public RatingController(RatingRepository ratingRepository,
                            TaskRepository taskRepository,
                            UserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.taskRepository   = taskRepository;
        this.userRepository   = userRepository;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    // Submit a rating for a completed task
    @PostMapping("/task/{taskId}")
    public ResponseEntity<?> submitRating(
            @PathVariable Long taskId,
            @RequestBody Map<String, Object> body) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getStatus() != Task.TaskStatus.COMPLETED) {
            return ResponseEntity.badRequest().body(Map.of("message", "Can only rate completed tasks"));
        }

        User rater = currentUser();

        if (ratingRepository.existsByTaskIdAndRaterId(taskId, rater.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "You have already rated this task"));
        }

        // Determine who is being rated
        User rated;
        String ratingType;
        if (rater.getRole() == User.Role.FARMER && task.getFarmer() != null
                && task.getFarmer().getId().equals(rater.getId())) {
            // Farmer rating the worker
            if (task.getWorker() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "No worker assigned to this task"));
            }
            rated = task.getWorker();
            ratingType = "FARMER_TO_WORKER";
        } else if (rater.getRole() == User.Role.WORKER && task.getWorker() != null
                && task.getWorker().getId().equals(rater.getId())) {
            // Worker rating the farmer
            rated = task.getFarmer();
            ratingType = "WORKER_TO_FARMER";
        } else {
            return ResponseEntity.status(403).body(Map.of("message", "Not authorized to rate this task"));
        }

        int stars = Integer.parseInt(body.get("stars").toString());
        if (stars < 1 || stars > 5) {
            return ResponseEntity.badRequest().body(Map.of("message", "Stars must be between 1 and 5"));
        }

        Rating rating = new Rating();
        rating.setTaskId(taskId);
        rating.setRaterId(rater.getId());
        rating.setRatedId(rated.getId());
        rating.setRatingType(ratingType);
        rating.setStars(stars);
        rating.setComment(body.get("comment") != null ? body.get("comment").toString() : null);

        return ResponseEntity.ok(ratingRepository.save(rating));
    }

    // Get all ratings for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserRatings(@PathVariable Long userId) {
        List<Rating> ratings = ratingRepository.findByRatedId(userId);
        Double avg = ratingRepository.avgStarsByRatedId(userId);
        return ResponseEntity.ok(Map.of(
                "ratings", ratings,
                "average", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
                "count", ratings.size()
        ));
    }

    // Get ratings for a specific task
    @GetMapping("/task/{taskId}")
    public ResponseEntity<?> getTaskRatings(@PathVariable Long taskId) {
        return ResponseEntity.ok(ratingRepository.findByTaskId(taskId));
    }

    // Check if current user already rated a task
    @GetMapping("/task/{taskId}/my")
    public ResponseEntity<?> myRating(@PathVariable Long taskId) {
        User user = currentUser();
        return ResponseEntity.ok(Map.of(
                "rated", ratingRepository.existsByTaskIdAndRaterId(taskId, user.getId())
        ));
    }
}
