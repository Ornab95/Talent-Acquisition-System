package com.tas.controller;

import com.tas.entity.Application;
import com.tas.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:4200")
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications(Authentication authentication) {
        try {
            List<Application> applications = applicationRepository.findAll();
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}