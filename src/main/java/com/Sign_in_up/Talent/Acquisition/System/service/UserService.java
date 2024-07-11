package com.Sign_in_up.Talent.Acquisition.System.service;


import com.Sign_in_up.Talent.Acquisition.System.model.User;
import com.Sign_in_up.Talent.Acquisition.System.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
}