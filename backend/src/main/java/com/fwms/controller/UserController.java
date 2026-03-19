package com.fwms.controller;

import com.fwms.model.User;
import com.fwms.repository.RatingRepository;
import com.fwms.repository.TaskRepository;
import com.fwms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final RatingRepository ratingRepository;

    public UserController(UserRepository userRepository, TaskRepository taskRepository, RatingRepository ratingRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.ratingRepository = ratingRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/farmers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getFarmers() {
        return ResponseEntity.ok(userRepository.findByRole(User.Role.FARMER));
    }

    @GetMapping("/workers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getWorkers() {
        return ResponseEntity.ok(userRepository.findByRole(User.Role.WORKER));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            // Nullify worker reference on tasks (worker leaving doesn't orphan the task)
            taskRepository.findByWorker(user).forEach(t -> { t.setWorker(null); taskRepository.save(t); });
            // Delete tasks owned by this farmer (they have no meaning without the farmer)
            taskRepository.deleteAll(taskRepository.findByFarmer(user));
            // Delete all ratings involving this user
            ratingRepository.deleteAll(ratingRepository.findByRaterId(id));
            ratingRepository.deleteAll(ratingRepository.findByRatedId(id));
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id).map(user -> {
            user.setStatus(User.UserStatus.valueOf(body.get("status")));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Status updated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
