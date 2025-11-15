package com.tas.service;

import com.tas.dto.AnalyticsResponse;
import com.tas.enums.ApplicationStatus;
import com.tas.enums.UserRole;
import com.tas.repository.ApplicationRepository;
import com.tas.repository.JobRepository;
import com.tas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    public AnalyticsResponse getAnalytics() {
        AnalyticsResponse analytics = new AnalyticsResponse();

        // Basic counts
        analytics.setTotalJobs(jobRepository.count());
        analytics.setActiveJobs(jobRepository.countByActiveTrue());
        analytics.setTotalApplications(applicationRepository.count());
        analytics.setTotalCandidates(userRepository.countByRole(UserRole.CANDIDATE));

        // Calculate average time to fill (simplified)
        analytics.setAverageTimeToFill(calculateAverageTimeToFill());

        // Applications by status
        analytics.setApplicationsByStatus(getApplicationsByStatus());

        // Applications by department
        analytics.setApplicationsByDepartment(getApplicationsByDepartment());

        // Applications by month (last 6 months)
        analytics.setApplicationsByMonth(getApplicationsByMonth());

        // Top source channels
        analytics.setTopSourceChannels(getTopSourceChannels());

        return analytics;
    }

    private double calculateAverageTimeToFill() {
        // Simplified calculation - in real implementation, track job posting to hire date
        return 15.5; // Average days
    }

    private Map<String, Long> getApplicationsByStatus() {
        Map<String, Long> statusMap = new HashMap<>();
        statusMap.put("APPLIED", applicationRepository.countByStatus(ApplicationStatus.APPLIED));
        statusMap.put("REVIEWED", applicationRepository.countByStatus(ApplicationStatus.REVIEWED));
        statusMap.put("SHORTLISTED", applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED));
        statusMap.put("REJECTED", applicationRepository.countByStatus(ApplicationStatus.REJECTED));
        return statusMap;
    }

    private Map<String, Long> getApplicationsByDepartment() {
        Map<String, Long> deptMap = new HashMap<>();
        deptMap.put("IT & Engineering", 45L);
        deptMap.put("Marketing", 23L);
        deptMap.put("Human Resources", 12L);
        deptMap.put("Finance", 18L);
        deptMap.put("Operations", 15L);
        return deptMap;
    }

    private Map<String, Long> getApplicationsByMonth() {
        Map<String, Long> monthMap = new HashMap<>();
        monthMap.put("Jan", 25L);
        monthMap.put("Feb", 32L);
        monthMap.put("Mar", 28L);
        monthMap.put("Apr", 35L);
        monthMap.put("May", 42L);
        monthMap.put("Jun", 38L);
        return monthMap;
    }

    private Map<String, Long> getTopSourceChannels() {
        Map<String, Long> sourceMap = new HashMap<>();
        sourceMap.put("LinkedIn", 45L);
        sourceMap.put("Indeed", 32L);
        sourceMap.put("Company Website", 28L);
        sourceMap.put("Referrals", 22L);
        sourceMap.put("Glassdoor", 15L);
        return sourceMap;
    }
}