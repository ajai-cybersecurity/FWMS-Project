package com.fwms.service;

import com.fwms.model.User;
import com.fwms.model.User.Role;
import com.fwms.repository.UserRepository;
import com.fwms.util.IdGenerator;
import com.fwms.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final IdGenerator idGenerator;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, AuthenticationManager authManager, IdGenerator idGenerator) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil         = jwtUtil;
        this.authManager     = authManager;
        this.idGenerator     = idGenerator;
    }

    // ─── Login ───────────────────────────────────────────
    public Map<String, Object> login(String identifier, String password, String roleStr) {
        // Resolve user by identifier (userId, phone, or email)
        User user = userRepository.findByEmail(identifier)
            .or(() -> userRepository.findByPhone(identifier))
            .or(() -> userRepository.findByUserId(identifier))
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        // Validate role matches
        if (!user.getRole().name().equals(roleStr.toUpperCase(java.util.Locale.ROOT))) {
            throw new BadCredentialsException("Login role does not match account type");
        }

        // Authenticate password
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(user.getEmail(), password));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getUserId());

        return Map.of(
            "token", token,
            "user",  toUserMap(user)
        );
    }

    // ─── Register Farmer ────────────────────────────────
    public Map<String, Object> registerFarmer(String fullName, String phone, String email,
                                               String address, String password,
                                               MultipartFile identityProof) throws IOException {
        validateUnique(email, phone);

        String fileUrl = saveFile(identityProof);
        String farmerId = idGenerator.generateFarmerId();

        User user = User.builder()
            .fullName(fullName)
            .phone(phone)
            .email(email)
            .address(address)
            .password(passwordEncoder.encode(password))
            .role(Role.FARMER)
            .userId(farmerId)
            .identityProofUrl(fileUrl)
            .build();

        User saved = userRepository.save(user);

        return Map.of(
            "message", "Farmer registered successfully",
            "userId", farmerId,
            "user", toUserMap(saved)
        );
    }

    // ─── Register Worker ────────────────────────────────
    public Map<String, Object> registerWorker(String fullName, String phone, String email,
                                               String address, String password, String skills,
                                               MultipartFile identityProof) throws IOException {
        validateUnique(email, phone);

        String fileUrl = saveFile(identityProof);
        String workerId = idGenerator.generateWorkerId();

        User user = User.builder()
            .fullName(fullName)
            .phone(phone)
            .email(email)
            .address(address)
            .password(passwordEncoder.encode(password))
            .role(Role.WORKER)
            .userId(workerId)
            .skills(skills)
            .identityProofUrl(fileUrl)
            .build();

        User saved = userRepository.save(user);

        return Map.of(
            "message", "Worker registered successfully",
            "userId", workerId,
            "user", toUserMap(saved)
        );
    }

    // ─── Helpers ─────────────────────────────────────────
    private void validateUnique(String email, String phone) {
        if (userRepository.existsByEmail(email))
            throw new IllegalArgumentException("Email already registered");
        if (userRepository.existsByPhone(phone))
            throw new IllegalArgumentException("Phone number already registered");
    }

    private String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;
        Path uploadDir = Paths.get("uploads");
        Files.createDirectories(uploadDir);
        // Sanitize filename to prevent path traversal
        String originalFilename = Paths.get(file.getOriginalFilename()).getFileName().toString();
        String filename = UUID.randomUUID() + "_" + originalFilename;
        Path filePath = uploadDir.resolve(filename).normalize();
        if (!filePath.startsWith(uploadDir.toAbsolutePath())) {
            throw new IOException("Invalid file path");
        }
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + filename;
    }

    private Map<String, Object> toUserMap(User u) {
        return Map.of(
            "id",       u.getId(),
            "fullName", u.getFullName(),
            "email",    u.getEmail(),
            "phone",    u.getPhone(),
            "userId",   u.getUserId(),
            "role",     u.getRole().name(),
            "status",   u.getStatus().name(),
            "address",  u.getAddress() != null ? u.getAddress() : "",
            "skills",   u.getSkills() != null ? u.getSkills() : ""
        );
    }
}
