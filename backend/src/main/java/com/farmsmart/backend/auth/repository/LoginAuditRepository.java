package com.farmsmart.backend.auth.repository;

import com.farmsmart.backend.auth.entity.LoginAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Repository for LoginAudit entity.
 * 
 * WARNING: This repository is public for technical reasons (Spring Data JPA requirement),
 * but MUST NOT be accessed from outside the auth module.
 */
public interface LoginAuditRepository extends JpaRepository<LoginAudit, UUID> {
}
