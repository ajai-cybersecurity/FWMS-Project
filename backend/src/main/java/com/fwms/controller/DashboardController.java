package com.fwms.controller;

import com.fwms.model.Task;
import com.fwms.model.User;
import com.fwms.repository.TaskRepository;
import com.fwms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public DashboardController(UserRepository userRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping("/admin")
    public ResponseEntity<?> adminStats() {
        long farmers        = userRepository.countByRole(User.Role.FARMER);
        long workers        = userRepository.countByRole(User.Role.WORKER);
        long tasks          = taskRepository.count();
        long activeTasks    = taskRepository.countByStatus(Task.TaskStatus.IN_PROGRESS);
        long completedTasks = taskRepository.countByStatus(Task.TaskStatus.COMPLETED);
        return ResponseEntity.ok(Map.of(
            "farmers", farmers,
            "workers", workers,
            "tasks", tasks,
            "activeTasks", activeTasks,
            "completedTasks", completedTasks
        ));
    }

    @GetMapping("/admin/charts")
    public ResponseEntity<?> adminCharts() {
        int year = LocalDate.now().getYear();
        String[] months = { "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec" };

        // Monthly task counts
        Map<Integer, Long> tasksByMonth = new HashMap<>();
        for (Object[] row : taskRepository.countTasksByMonth(year))
            tasksByMonth.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());

        // Monthly registrations by role
        Map<Integer, Long> farmersByMonth = new HashMap<>();
        Map<Integer, Long> workersByMonth = new HashMap<>();
        for (Object[] row : userRepository.countRegistrationsByMonth(year)) {
            int m = ((Number) row[0]).intValue();
            User.Role role = (User.Role) row[1];
            long count = ((Number) row[2]).longValue();
            if (role == User.Role.FARMER) farmersByMonth.put(m, count);
            else if (role == User.Role.WORKER) workersByMonth.put(m, count);
        }

        // Build activity array (only months that have data, up to current month)
        int currentMonth = LocalDate.now().getMonthValue();
        List<Map<String, Object>> activity = new ArrayList<>();
        for (int m = 1; m <= currentMonth; m++) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", months[m - 1]);
            entry.put("tasks",   tasksByMonth.getOrDefault(m, 0L));
            entry.put("farmers", farmersByMonth.getOrDefault(m, 0L));
            entry.put("workers", workersByMonth.getOrDefault(m, 0L));
            activity.add(entry);
        }

        // Task status breakdown
        Map<String, Long> statusMap = new LinkedHashMap<>();
        for (Object[] row : taskRepository.countByStatusGrouped())
            statusMap.put(row[0].toString(), ((Number) row[1]).longValue());

        List<Map<String, Object>> statusData = List.of(
            Map.of("name", "Completed",   "value", statusMap.getOrDefault("COMPLETED",   0L), "color", "#2d9631"),
            Map.of("name", "In Progress",  "value", statusMap.getOrDefault("IN_PROGRESS", 0L), "color", "#f59e0b"),
            Map.of("name", "Pending",      "value", statusMap.getOrDefault("PENDING",     0L), "color", "#6b7280"),
            Map.of("name", "Cancelled",    "value", statusMap.getOrDefault("CANCELLED",   0L), "color", "#ef4444")
        );

        return ResponseEntity.ok(Map.of("activity", activity, "statusData", statusData));
    }

    @GetMapping("/farmer")
    public ResponseEntity<?> farmerStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User farmer = userRepository.findByEmail(email).orElseThrow();

        long total     = taskRepository.countByFarmer(farmer);
        long active    = taskRepository.findByFarmerAndStatus(farmer, Task.TaskStatus.IN_PROGRESS).size();
        long completed = taskRepository.findByFarmerAndStatus(farmer, Task.TaskStatus.COMPLETED).size();
        long workers   = taskRepository.findByFarmer(farmer).stream()
                            .filter(t -> t.getWorker() != null)
                            .map(t -> t.getWorker().getId())
                            .distinct().count();

        return ResponseEntity.ok(Map.of(
            "total", total,
            "active", active,
            "completed", completed,
            "workers", workers
        ));
    }

    @GetMapping("/worker")
    public ResponseEntity<?> workerStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User worker = userRepository.findByEmail(email).orElseThrow();

        long accepted  = taskRepository.countByWorker(worker);
        long completed = taskRepository.findByWorker(worker).stream()
                            .filter(t -> t.getStatus() == Task.TaskStatus.COMPLETED).count();
        double earnings = taskRepository.findByWorker(worker).stream()
                            .filter(t -> t.getStatus() == Task.TaskStatus.COMPLETED && t.getWage() != null)
                            .mapToDouble(Task::getWage).sum();

        return ResponseEntity.ok(Map.of(
            "accepted", accepted,
            "completed", completed,
            "earnings", earnings,
            "rating", 4.8
        ));
    }
}
