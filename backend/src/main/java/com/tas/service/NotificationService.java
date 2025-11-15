package com.tas.service;

import com.tas.entity.Interview;
import com.tas.event.InterviewScheduledEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TemplateEngine templateEngine;

    @EventListener
    public void handleInterviewScheduled(InterviewScheduledEvent event) {
        Interview interview = event.getInterview();
        logger.info("Sending interview notification for interview ID: {}", interview.getId());
        
        try {
            sendInterviewNotification(interview);
        } catch (Exception e) {
            logger.error("Failed to send interview notification: {}", e.getMessage());
        }
    }

    private void sendInterviewNotification(Interview interview) throws MessagingException {
        // Send to candidate
        String candidateEmail = interview.getApplication().getCandidate().getEmail();
        sendEmail(candidateEmail, "Interview Scheduled", "interview-scheduled", interview);
        
        // Send to interviewer
        String interviewerEmail = interview.getInterviewer().getEmail();
        sendEmail(interviewerEmail, "Interview Assignment", "interview-assigned", interview);
    }

    private void sendEmail(String to, String subject, String template, Interview interview) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        
        Context context = new Context();
        context.setVariable("candidateName", 
            interview.getApplication().getCandidate().getFirstName() + " " + 
            interview.getApplication().getCandidate().getLastName());
        context.setVariable("interviewerName", 
            interview.getInterviewer().getFirstName() + " " + 
            interview.getInterviewer().getLastName());
        context.setVariable("jobTitle", interview.getApplication().getJob().getTitle());
        context.setVariable("scheduledTime", 
            interview.getScheduledAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a")));
        context.setVariable("interviewType", interview.getInterviewType().toString());
        context.setVariable("meetingLink", interview.getMeetingLink());
        
        String htmlContent = templateEngine.process(template, context);
        
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        helper.setFrom("noreply@tas.com");
        
        mailSender.send(message);
        logger.info("Email sent successfully to: {}", to);
    }
}