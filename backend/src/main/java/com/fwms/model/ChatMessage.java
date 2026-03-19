package com.fwms.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long taskId;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private String senderName;

    @Column(nullable = false)
    private String senderRole;

    @Column(nullable = false, length = 2000)
    private String message;

    @CreationTimestamp
    private LocalDateTime sentAt;

    public ChatMessage() {}

    public Long getId() { return id; }
    public Long getTaskId() { return taskId; }
    public void setTaskId(Long v) { this.taskId = v; }
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long v) { this.senderId = v; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String v) { this.senderName = v; }
    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String v) { this.senderRole = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
    public LocalDateTime getSentAt() { return sentAt; }
}
