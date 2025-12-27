package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.UserInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserInvitationRepository extends JpaRepository<UserInvitation, UUID> {
    Optional<UserInvitation> findByToken(String token);
    Optional<UserInvitation> findByEmailAndStatus(String email, UserInvitation.InvitationStatus status);
}
