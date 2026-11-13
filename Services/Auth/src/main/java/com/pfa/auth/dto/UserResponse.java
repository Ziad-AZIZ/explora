package com.pfa.auth.dto;

import com.pfa.auth.model.User;

import java.time.LocalDateTime;

/**
 * DTO - Reponse renvoyee au client (sans le mot de passe).
 */
public class UserResponse {

    private Long id;
    private String name;
    private String username;
    private String email;
    private String profilePic;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(Long id, String name, String username, String email,
                        String profilePic, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
        this.profilePic = profilePic;
        this.createdAt = createdAt;
    }

    /** Convertit une entite User en UserResponse (sans le mot de passe). */
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getProfilePic(),
                user.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
