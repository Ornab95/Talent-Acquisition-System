package com.tas.controller;

import com.tas.dto.AnalyticsResponse;
import com.tas.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:4200")
public class AnalyticsController {
    
    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);
    
    @Autowired
    private AnalyticsService analyticsService;
    
    @GetMapping
    @PreAuthorize("hasRole('HR_ADMIN') or hasRole('RECRUITER') or hasRole('HIRING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        try {
            logger.info("Fetching analytics data");
            AnalyticsResponse analytics = analyticsService.getAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            logger.error("Error fetching analytics: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}