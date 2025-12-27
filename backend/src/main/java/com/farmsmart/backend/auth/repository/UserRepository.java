package com.farmsmart.backend.auth.repository;

import com.farmsmart.backend.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for User entity.
 * 
 * WARNING: This repository is public for technical reasons (Spring Data JPA requirement),
 * but MUST NOT be accessed from outside the auth module.
 * Other modules should use UserService.getCurrentUser() instead.
 */
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleSub(String googleSub);
    boolean existsByEmail(String email);
}
