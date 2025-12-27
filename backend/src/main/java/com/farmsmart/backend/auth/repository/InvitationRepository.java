package com.farmsmart.backend.auth.repository;

import com.farmsmart.backend.auth.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Invitation entity.
 * 
 * WARNING: This repository is public for technical reasons (Spring Data JPA requirement),
 * but MUST NOT be accessed from outside the auth module.
 */
public interface InvitationRepository extends JpaRepository<Invitation, UUID> {
    Optional<Invitation> findByCode(String code);
    Optional<Invitation> findByEmailAndStatus(String email, Invitation.InvitationStatus status);
}
