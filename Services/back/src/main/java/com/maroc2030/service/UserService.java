package com.maroc2030.service;

import com.maroc2030.model.Theme;
import com.maroc2030.model.User;
import com.maroc2030.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getOrCreateUser(Long id, String email) {
        return userRepository.findById(id)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setId(id);
                    newUser.setEmail(email);
                    newUser.setName(email.split("@")[0]); // Default name
                    newUser.setTheme(Theme.LIGHT);
                    newUser.setNotificationsEnabled(true);
                    return userRepository.save(newUser);
                });
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (user.getTheme() == null) {
            user.setTheme(Theme.LIGHT);
        }
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setName(userDetails.getName());
        if (userDetails.getEmail() != null && !userDetails.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(userDetails.getEmail());
        }
        user.setPhone(userDetails.getPhone());
        user.setProfileImageUrl(userDetails.getProfileImageUrl());
        user.setPreferredLanguage(userDetails.getPreferredLanguage());
        user.setNotificationsEnabled(userDetails.getNotificationsEnabled());

        return userRepository.save(user);
    }

    @Transactional
    public User updateTheme(Long id, Theme theme) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setTheme(theme);
        return userRepository.save(user);
    }

    @Transactional
    public User updateNotifications(Long id, Boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setNotificationsEnabled(enabled);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}