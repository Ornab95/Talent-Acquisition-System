package com.tas.controller;

import com.tas.dto.AuthResponse;
import com.tas.dto.LoginRequest;
import com.tas.entity.User;
import com.tas.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            logger.info("Login request received for email: {}", request.getEmail());
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("Login failed: {}", e.getMessage());
            return ResponseEntity.status(401).body("Invalid credentials");
        } catch (Exception e) {
            logger.error("Server error during login", e);
            return ResponseEntity.status(500).body("Server error");
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            logger.info("Registration request received for email: {}", user.getEmail());
            User savedUser = authService.register(user);
            savedUser.setPassword(null); // Don't return password
            return ResponseEntity.ok(savedUser);
        } catch (RuntimeException e) {
            logger.warn("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(400).body("Registration failed");
        } catch (Exception e) {
            logger.error("Server error during registration", e);
            return ResponseEntity.status(500).body("Server error");
        }
    }
}