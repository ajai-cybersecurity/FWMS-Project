package com.fwms.controller;

import com.fwms.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {
        try {
            Map<String, Object> result = authService.login(
                req.get("identifier"),
                req.get("password"),
                req.get("role")
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register/farmer")
    public ResponseEntity<?> registerFarmer(
        @RequestParam String fullName,
        @RequestParam String phone,
        @RequestParam String email,
        @RequestParam(required = false) String address,
        @RequestParam String password,
        @RequestParam(required = false) MultipartFile identityProof
    ) {
        try {
            Map<String, Object> result = authService.registerFarmer(
                fullName, phone, email, address, password, identityProof);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "File upload failed"));
        }
    }

    @PostMapping("/register/worker")
    public ResponseEntity<?> registerWorker(
        @RequestParam String fullName,
        @RequestParam String phone,
        @RequestParam String email,
        @RequestParam(required = false) String address,
        @RequestParam String password,
        @RequestParam(required = false) String skills,
        @RequestParam(required = false) MultipartFile identityProof
    ) {
        try {
            Map<String, Object> result = authService.registerWorker(
                fullName, phone, email, address, password, skills, identityProof);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "File upload failed"));
        }
    }
}
