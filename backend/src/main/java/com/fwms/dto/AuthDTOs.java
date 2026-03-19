package com.fwms.dto;

import com.fwms.model.Task;
import com.fwms.model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;

// ════════════════════════════════════════════════════
//  AUTH DTOs
// ════════════════════════════════════════════════════

class AuthDTO {

    static class LoginRequest {
        private String identifier;
        private String password;
        private String role;

        public LoginRequest() {}
        public String getIdentifier() { return identifier; }
        public void setIdentifier(String v) { this.identifier = v; }
        public String getPassword() { return password; }
        public void setPassword(String v) { this.password = v; }
        public String getRole() { return role; }
        public void setRole(String v) { this.role = v; }
    }

    static class LoginResponse {
        private String token;
        private UserDTO user;

        public LoginResponse() {}
        public LoginResponse(String token, UserDTO user) { this.token = token; this.user = user; }
        public String getToken() { return token; }
        public UserDTO getUser() { return user; }
    }

    static class RegisterResponse {
        private String message;
        private String userId;
        private UserDTO user;

        public RegisterResponse() {}
        public RegisterResponse(String message, String userId, UserDTO user) {
            this.message = message; this.userId = userId; this.user = user;
        }
        public String getMessage() { return message; }
        public String getUserId() { return userId; }
        public UserDTO getUser() { return user; }
    }
}

// ════════════════════════════════════════════════════
//  USER DTO
// ════════════════════════════════════════════════════

class UserDTO {
    private Long id; private String fullName; private String email; private String phone;
    private String userId; private String address; private String role; private String status;
    private String skills; private String identityProofUrl; private LocalDateTime createdAt;

    public UserDTO() {}

    public static Builder builder() { return new Builder(); }

    static class Builder {
        private Long id; private String fullName; private String email; private String phone;
        private String userId; private String address; private String role; private String status;
        private String skills; private String identityProofUrl; private LocalDateTime createdAt;

        public Builder id(Long v) { this.id = v; return this; }
        public Builder fullName(String v) { this.fullName = v; return this; }
        public Builder email(String v) { this.email = v; return this; }
        public Builder phone(String v) { this.phone = v; return this; }
        public Builder userId(String v) { this.userId = v; return this; }
        public Builder address(String v) { this.address = v; return this; }
        public Builder role(String v) { this.role = v; return this; }
        public Builder status(String v) { this.status = v; return this; }
        public Builder skills(String v) { this.skills = v; return this; }
        public Builder identityProofUrl(String v) { this.identityProofUrl = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }

        public UserDTO build() {
            UserDTO d = new UserDTO();
            d.id = id; d.fullName = fullName; d.email = email; d.phone = phone;
            d.userId = userId; d.address = address; d.role = role; d.status = status;
            d.skills = skills; d.identityProofUrl = identityProofUrl; d.createdAt = createdAt;
            return d;
        }
    }

    public static UserDTO from(User u) {
        return UserDTO.builder()
            .id(u.getId()).fullName(u.getFullName()).email(u.getEmail()).phone(u.getPhone())
            .userId(u.getUserId()).address(u.getAddress()).role(u.getRole().name())
            .status(u.getStatus().name()).skills(u.getSkills())
            .identityProofUrl(u.getIdentityProofUrl()).createdAt(u.getCreatedAt()).build();
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getUserId() { return userId; }
    public String getAddress() { return address; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
    public String getSkills() { return skills; }
    public String getIdentityProofUrl() { return identityProofUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

// ════════════════════════════════════════════════════
//  TASK DTOs
// ════════════════════════════════════════════════════

class TaskDTO {

    static class Request {
        private String title; private String description; private String location;
        private LocalDate date; private Double wage; private String status;

        public Request() {}
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
        public String getStatus() { return status; }
        public void setStatus(String v) { this.status = v; }
    }

    static class Response {
        private Long id; private String title; private String description; private String location;
        private LocalDate date; private Double wage; private String status;
        private String farmerName; private String farmerId; private String workerName;
        private String workerId; private LocalDateTime createdAt;

        public Response() {}

        public static Builder builder() { return new Builder(); }

        static class Builder {
            private Long id; private String title; private String description; private String location;
            private LocalDate date; private Double wage; private String status;
            private String farmerName; private String farmerId; private String workerName;
            private String workerId; private LocalDateTime createdAt;

            public Builder id(Long v) { this.id = v; return this; }
            public Builder title(String v) { this.title = v; return this; }
            public Builder description(String v) { this.description = v; return this; }
            public Builder location(String v) { this.location = v; return this; }
            public Builder date(LocalDate v) { this.date = v; return this; }
            public Builder wage(Double v) { this.wage = v; return this; }
            public Builder status(String v) { this.status = v; return this; }
            public Builder farmerName(String v) { this.farmerName = v; return this; }
            public Builder farmerId(String v) { this.farmerId = v; return this; }
            public Builder workerName(String v) { this.workerName = v; return this; }
            public Builder workerId(String v) { this.workerId = v; return this; }
            public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }

            public Response build() {
                Response r = new Response();
                r.id = id; r.title = title; r.description = description; r.location = location;
                r.date = date; r.wage = wage; r.status = status; r.farmerName = farmerName;
                r.farmerId = farmerId; r.workerName = workerName; r.workerId = workerId;
                r.createdAt = createdAt;
                return r;
            }
        }

        public static Response from(Task t) {
            return Response.builder()
                .id(t.getId()).title(t.getTitle()).description(t.getDescription())
                .location(t.getLocation()).date(t.getDate()).wage(t.getWage())
                .status(t.getStatus().name())
                .farmerName(t.getFarmer() != null ? t.getFarmer().getFullName() : null)
                .farmerId(t.getFarmer() != null ? t.getFarmer().getUserId() : null)
                .workerName(t.getWorker() != null ? t.getWorker().getFullName() : null)
                .workerId(t.getWorker() != null ? t.getWorker().getUserId() : null)
                .createdAt(t.getCreatedAt()).build();
        }

        public Long getId() { return id; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getLocation() { return location; }
        public LocalDate getDate() { return date; }
        public Double getWage() { return wage; }
        public String getStatus() { return status; }
        public String getFarmerName() { return farmerName; }
        public String getFarmerId() { return farmerId; }
        public String getWorkerName() { return workerName; }
        public String getWorkerId() { return workerId; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}

// ════════════════════════════════════════════════════
//  DASHBOARD DTOs
// ════════════════════════════════════════════════════

class DashboardDTO {

    static class AdminStats {
        private long farmers; private long workers; private long tasks;
        private long activeTasks; private long completedTasks;

        public AdminStats() {}
        public AdminStats(long farmers, long workers, long tasks, long activeTasks, long completedTasks) {
            this.farmers = farmers; this.workers = workers; this.tasks = tasks;
            this.activeTasks = activeTasks; this.completedTasks = completedTasks;
        }
        public long getFarmers() { return farmers; }
        public long getWorkers() { return workers; }
        public long getTasks() { return tasks; }
        public long getActiveTasks() { return activeTasks; }
        public long getCompletedTasks() { return completedTasks; }
    }

    static class FarmerStats {
        private long total; private long active; private long completed; private long workers;

        public FarmerStats() {}
        public FarmerStats(long total, long active, long completed, long workers) {
            this.total = total; this.active = active; this.completed = completed; this.workers = workers;
        }
        public long getTotal() { return total; }
        public long getActive() { return active; }
        public long getCompleted() { return completed; }
        public long getWorkers() { return workers; }
    }

    static class WorkerStats {
        private long accepted; private long completed; private double earnings; private double rating;

        public WorkerStats() {}
        public WorkerStats(long accepted, long completed, double earnings, double rating) {
            this.accepted = accepted; this.completed = completed;
            this.earnings = earnings; this.rating = rating;
        }
        public long getAccepted() { return accepted; }
        public long getCompleted() { return completed; }
        public double getEarnings() { return earnings; }
        public double getRating() { return rating; }
    }
}
