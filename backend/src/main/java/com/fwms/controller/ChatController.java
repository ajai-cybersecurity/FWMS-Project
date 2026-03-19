package com.fwms.controller;

import com.fwms.model.ChatMessage;
import com.fwms.model.Task;
import com.fwms.model.User;
import com.fwms.repository.ChatMessageRepository;
import com.fwms.repository.TaskRepository;
import com.fwms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatMessageRepository chatRepo;
    private final TaskRepository taskRepo;
    private final UserRepository userRepo;

    public ChatController(ChatMessageRepository chatRepo, TaskRepository taskRepo, UserRepository userRepo) {
        this.chatRepo = chatRepo;
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email).orElseThrow();
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable Long taskId) {
        return ResponseEntity.ok(chatRepo.findByTaskIdOrderBySentAtAsc(taskId));
    }

    @PostMapping("/{taskId}")
    public ResponseEntity<?> sendMessage(@PathVariable Long taskId, @RequestBody Map<String, String> body) {
        String text = body.get("message");
        if (text == null || text.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "Message cannot be empty"));

        Task task = taskRepo.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        User sender = currentUser();

        // Only farmer or assigned worker can chat
        boolean isFarmer = task.getFarmer() != null && task.getFarmer().getId().equals(sender.getId());
        boolean isWorker = task.getWorker() != null && task.getWorker().getId().equals(sender.getId());
        if (!isFarmer && !isWorker)
            return ResponseEntity.status(403).body(Map.of("message", "Not authorized to chat on this task"));

        ChatMessage msg = new ChatMessage();
        msg.setTaskId(taskId);
        msg.setSenderId(sender.getId());
        msg.setSenderName(sender.getFullName());
        msg.setSenderRole(sender.getRole().name());
        msg.setMessage(text.trim());

        return ResponseEntity.ok(chatRepo.save(msg));
    }
}
