package com.farmsmart.backend.auth.service;

import com.farmsmart.backend.auth.dto.AuthenticatedUser;
import com.farmsmart.backend.auth.dto.response.UserInfoResponse;
import com.farmsmart.backend.auth.entity.User;
import com.farmsmart.backend.auth.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Public service for accessing user information.
 * This is the ONLY way other modules should access user data.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get current authenticated user.
     * Returns AuthenticatedUser abstraction, not the entity.
     */
    public AuthenticatedUser getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
            return mapToAuthenticatedUser(user);
        }
        
        throw new IllegalStateException("No authenticated user found");
    }

    /**
     * Get user info for /me endpoint.
     */
    public UserInfoResponse getCurrentUserInfo() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
            return mapToUserInfoResponse(user);
        }
        
        throw new IllegalStateException("No authenticated user found");
    }

    /**
     * Get user by ID (returns abstraction).
     */
    public Optional<AuthenticatedUser> getUserById(UUID id) {
        return userRepository.findById(id)
                .map(this::mapToAuthenticatedUser);
    }

    /**
     * Map User entity to AuthenticatedUser abstraction.
     */
    private AuthenticatedUser mapToAuthenticatedUser(User user) {
        return new AuthenticatedUser(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet())
        );
    }

    /**
     * Map User entity to UserInfoResponse.
     */
    private UserInfoResponse mapToUserInfoResponse(User user) {
        return new UserInfoResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()),
            user.isTwoFactorEnabled(),
            user.isEnabled()
        );
    }
    /**
     * Update current user profile.
     */
    public UserInfoResponse updateProfile(com.farmsmart.backend.auth.dto.request.UpdateProfileRequest request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
            
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            
            user = userRepository.save(user);
            
            return mapToUserInfoResponse(user);
        }
        
        throw new IllegalStateException("No authenticated user found");
    }
}
