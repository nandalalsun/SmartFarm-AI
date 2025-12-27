package com.farmsmart.backend.auth.repository;

import com.farmsmart.backend.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository for Role entity.
 * 
 * WARNING: This repository is public for technical reasons (Spring Data JPA requirement),
 * but MUST NOT be accessed from outside the auth module.
 */
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(Role.RoleName name);
}
