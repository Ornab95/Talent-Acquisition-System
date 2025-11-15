package com.tas.controller;

import com.tas.entity.Job;
import com.tas.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {
    
    private static final Logger logger = LoggerFactory.getLogger(JobController.class);
    
    @Autowired
    private JobService jobService;
    
    @GetMapping("/public")
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllActiveJobs());
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<Job>> getMyJobs() {
        return ResponseEntity.ok(jobService.getJobsByCurrentUser());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobService.getJobById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Job> createJob(@Valid @RequestBody Job job) {
        try {
            Job createdJob = jobService.createJob(job);
            logger.info("Job created successfully with ID: {}", createdJob.getId());
            return ResponseEntity.ok(createdJob);
        } catch (Exception e) {
            logger.error("Error creating job", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @Valid @RequestBody Job job) {
        try {
            logger.info("Updating job with ID: {}", id);
            Job updatedJob = jobService.updateJob(id, job);
            logger.info("Job updated successfully with ID: {}", id);
            return ResponseEntity.ok(updatedJob);
        } catch (Exception e) {
            logger.error("Error updating job with ID: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        try {
            jobService.deleteJob(id);
            logger.info("Job deleted successfully with ID: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting job with ID: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }
}