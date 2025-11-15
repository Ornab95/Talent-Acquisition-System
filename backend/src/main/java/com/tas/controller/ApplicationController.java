package com.tas.controller;

import com.tas.entity.Application;
import com.tas.entity.Job;
import com.tas.entity.User;
import com.tas.repository.ApplicationRepository;
import com.tas.repository.JobRepository;
import com.tas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:4200")
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications(Authentication authentication) {
        try {
            List<Application> applications = applicationRepository.findAll();
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Application> createApplication(
            @RequestParam("jobId") Long jobId,
            @RequestParam("coverLetter") String coverLetter,
            @RequestParam(value = "portfolioUrl", required = false) String portfolioUrl,
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User candidate = userRepository.findByEmail(userEmail).orElse(null);
            if (candidate == null) {
                return ResponseEntity.status(401).build();
            }
            
            Job job = jobRepository.findById(jobId).orElse(null);
            if (job == null) {
                return ResponseEntity.status(404).build();
            }
            
            Application application = new Application();
            application.setJob(job);
            application.setCandidate(candidate);
            application.setCoverLetter(coverLetter);
            application.setPortfolioUrl(portfolioUrl);
            
            if (resume != null && !resume.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + resume.getOriginalFilename();
                String uploadDir = "uploads/resumes/";
                
                // Create directory if it doesn't exist
                File directory = new File(uploadDir);
                if (!directory.exists()) {
                    directory.mkdirs();
                }
                
                Path filePath = Paths.get(uploadDir + fileName);
                Files.write(filePath, resume.getBytes());
                
                application.setResumeFileName(resume.getOriginalFilename());
                application.setResumeFilePath(fileName);
                application.setResumeData(resume.getBytes());
            }
            
            Application savedApplication = applicationRepository.save(application);
            return ResponseEntity.ok(savedApplication);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Application>> getApplicationsByJob(@PathVariable Long jobId, Authentication authentication) {
        try {
            List<Application> applications = applicationRepository.findByJobId(jobId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/my-applications")
    public ResponseEntity<List<Application>> getMyApplications(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User candidate = userRepository.findByEmail(userEmail).orElse(null);
            if (candidate == null) {
                return ResponseEntity.status(401).build();
            }
            
            List<Application> applications = applicationRepository.findByCandidateId(candidate.getId());
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}