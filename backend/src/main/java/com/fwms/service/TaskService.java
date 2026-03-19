package com.fwms.service;

import com.fwms.model.Task;
import com.fwms.model.Task.TaskStatus;
import com.fwms.model.User;
import com.fwms.repository.TaskRepository;
import com.fwms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getMyTasks() {
        User user = currentUser();
        return switch (user.getRole()) {
            case FARMER -> taskRepository.findByFarmer(user);
            case WORKER -> taskRepository.findByWorker(user);
            case ADMIN  -> taskRepository.findAll();
        };
    }

    public List<Task> getAvailableTasks() {
        return taskRepository.findByWorkerIsNullAndStatus(TaskStatus.PENDING);
    }

    public Task getById(Long id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found: " + id));
    }

    public Task createTask(Map<String, Object> data) {
        User farmer = currentUser();
        Task task = Task.builder()
            .title((String) data.get("title"))
            .description((String) data.get("description"))
            .location((String) data.get("location"))
            .date(data.get("date") != null ? java.time.LocalDate.parse((String) data.get("date")) : null)
            .wage(data.get("wage") != null ? Double.parseDouble(data.get("wage").toString()) : null)
            .farmer(farmer)
            .status(TaskStatus.PENDING)
            .build();
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Map<String, Object> data) {
        Task task = getById(id);
        if (data.containsKey("title"))       task.setTitle((String) data.get("title"));
        if (data.containsKey("description")) task.setDescription((String) data.get("description"));
        if (data.containsKey("location"))    task.setLocation((String) data.get("location"));
        if (data.containsKey("date"))        task.setDate(java.time.LocalDate.parse((String) data.get("date")));
        if (data.containsKey("wage"))        task.setWage(Double.parseDouble(data.get("wage").toString()));
        if (data.containsKey("status")) {
            task.setStatus(TaskStatus.valueOf((String) data.get("status")));
        }
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public Task acceptTask(Long id) {
        Task task = getById(id);
        User worker = currentUser();
        if (task.getWorker() != null) throw new RuntimeException("Task already taken");
        task.setWorker(worker);
        task.setStatus(TaskStatus.IN_PROGRESS);
        return taskRepository.save(task);
    }

    public Task rejectWorker(Long id) {
        Task task = getById(id);
        task.setWorker(null);
        task.setStatus(TaskStatus.PENDING);
        return taskRepository.save(task);
    }

    public Task completeTask(Long id) {
        Task task = getById(id);
        task.setStatus(TaskStatus.COMPLETED);
        return taskRepository.save(task);
    }
}
