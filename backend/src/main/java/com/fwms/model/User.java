package com.fwms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(unique = true, nullable = false)
    private String phone;

    @Column(unique = true, nullable = false)
    private String userId;

    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.ACTIVE;

    private String skills;

    private String identityProofUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Role { ADMIN, FARMER, WORKER }
    public enum UserStatus { ACTIVE, SUSPENDED, PENDING }

    public User() {}

    public User(Long id, String fullName, String email, String password, String phone,
                String userId, String address, Role role, UserStatus status,
                String skills, String identityProofUrl, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id; this.fullName = fullName; this.email = email; this.password = password;
        this.phone = phone; this.userId = userId; this.address = address; this.role = role;
        this.status = status; this.skills = skills; this.identityProofUrl = identityProofUrl;
        this.createdAt = createdAt; this.updatedAt = updatedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id; private String fullName; private String email; private String password;
        private String phone; private String userId; private String address; private Role role;
        private UserStatus status = UserStatus.ACTIVE; private String skills;
        private String identityProofUrl;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder fullName(String v) { this.fullName = v; return this; }
        public Builder email(String v) { this.email = v; return this; }
        public Builder password(String v) { this.password = v; return this; }
        public Builder phone(String v) { this.phone = v; return this; }
        public Builder userId(String v) { this.userId = v; return this; }
        public Builder address(String v) { this.address = v; return this; }
        public Builder role(Role v) { this.role = v; return this; }
        public Builder status(UserStatus v) { this.status = v; return this; }
        public Builder skills(String v) { this.skills = v; return this; }
        public Builder identityProofUrl(String v) { this.identityProofUrl = v; return this; }

        public User build() {
            User u = new User();
            u.id = id; u.fullName = fullName; u.email = email; u.password = password;
            u.phone = phone; u.userId = userId; u.address = address; u.role = role;
            u.status = status; u.skills = skills; u.identityProofUrl = identityProofUrl;
            return u;
        }
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public void setFullName(String v) { this.fullName = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getPassword() { return password; }
    public void setPassword(String v) { this.password = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { this.phone = v; }
    public String getUserId() { return userId; }
    public void setUserId(String v) { this.userId = v; }
    public String getAddress() { return address; }
    public void setAddress(String v) { this.address = v; }
    public Role getRole() { return role; }
    public void setRole(Role v) { this.role = v; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus v) { this.status = v; }
    public String getSkills() { return skills; }
    public void setSkills(String v) { this.skills = v; }
    public String getIdentityProofUrl() { return identityProofUrl; }
    public void setIdentityProofUrl(String v) { this.identityProofUrl = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
