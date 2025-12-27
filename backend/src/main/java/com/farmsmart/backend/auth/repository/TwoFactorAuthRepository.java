package com.farmsmart.backend.auth.repository;

import com.farmsmart.backend.auth.entity.TwoFactorAuth;
import com.farmsmart.backend.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for TwoFactorAuth entity.
 * 
 * WARNING: This repository is public for technical reasons (Spring Data JPA requirement),
 * but MUST NOT be accessed from outside the auth module.
 */
public interface TwoFactorAuthRepository extends JpaRepository<TwoFactorAuth, UUID> {
    Optional<TwoFactorAuth> findByUser(User user);
}
