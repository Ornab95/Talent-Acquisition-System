package com.Sign_in_up.Talent.Acquisition.System.controller;

import com.Sign_in_up.Talent.Acquisition.System.model.User;
import com.Sign_in_up.Talent.Acquisition.System.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public User signUp(@RequestBody User user) {
        // Additional validation logic can be added here
        return userService.saveUser(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody User loginUser) {
        User existingUser = userService.findByEmail(loginUser.getEmail());
        if (existingUser != null && existingUser.getPassword().equals(loginUser.getPassword())) {
            return existingUser;
        }
        return null; // Handle invalid credentials
    }
}