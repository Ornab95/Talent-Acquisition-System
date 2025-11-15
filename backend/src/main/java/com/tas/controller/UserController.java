package com.tas.controller;

import com.tas.entity.User;
import com.tas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody Map<String, String> updates, Authentication authentication) {
        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            
            if (updates.containsKey("firstName")) {
                user.setFirstName(updates.get("firstName"));
            }
            if (updates.containsKey("lastName")) {
                user.setLastName(updates.get("lastName"));
            }
            if (updates.containsKey("email")) {
                user.setEmail(updates.get("email"));
            }
            if (updates.containsKey("phone")) {
                user.setPhone(updates.get("phone"));
            }
            if (updates.containsKey("department")) {
                user.setDepartment(updates.get("department"));
            }
            
            User updatedUser = userRepository.save(user);
            updatedUser.setPassword(null); // Don't return password
            
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            logger.error("Error updating user", e);
            return ResponseEntity.status(500).body("Error updating user");
        }
    }
    
    @PutMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @RequestBody Map<String, String> passwordData, Authentication authentication) {
        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Current password and new password are required");
            }
            
            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body("Current password is incorrect");
            }
            
            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            return ResponseEntity.ok().body("Password changed successfully");
        } catch (Exception e) {
            logger.error("Error changing password", e);
            return ResponseEntity.status(500).body("Error changing password");
        }
    }
}