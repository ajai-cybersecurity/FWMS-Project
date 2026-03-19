package com.fwms.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String location;
    private LocalDate date;
    private Double wage;

    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.PENDING;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "farmer_id")
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User farmer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "worker_id")
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User worker;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum TaskStatus { PENDING, IN_PROGRESS, COMPLETED, CANCELLED }

    public Task() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String title; private String description; private String location;
        private LocalDate date; private Double wage; private TaskStatus status = TaskStatus.PENDING;
        private User farmer; private User worker;

        public Builder title(String v) { this.title = v; return this; }
        public Builder description(String v) { this.description = v; return this; }
        public Builder location(String v) { this.location = v; return this; }
        public Builder date(LocalDate v) { this.date = v; return this; }
        public Builder wage(Double v) { this.wage = v; return this; }
        public Builder status(TaskStatus v) { this.status = v; return this; }
        public Builder farmer(User v) { this.farmer = v; return this; }
        public Builder worker(User v) { this.worker = v; return this; }

        public Task build() {
            Task t = new Task();
            t.title = title; t.description = description; t.location = location;
            t.date = date; t.wage = wage; t.status = status;
            t.farmer = farmer; t.worker = worker;
            return t;
        }
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public String getLocation() { return location; }
    public void setLocation(String v) { this.location = v; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate v) { this.date = v; }
    public Double getWage() { return wage; }
    public void setWage(Double v) { this.wage = v; }
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus v) { this.status = v; }
    public User getFarmer() { return farmer; }
    public void setFarmer(User v) { this.farmer = v; }
    public User getWorker() { return worker; }
    public void setWorker(User v) { this.worker = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
