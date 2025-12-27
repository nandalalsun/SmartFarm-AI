package com.farmsmart.backend.auth.service;

import com.farmsmart.backend.auth.dto.request.InvitationRequest;
import com.farmsmart.backend.auth.dto.response.InvitationResponse;
import com.farmsmart.backend.auth.entity.Invitation;
import com.farmsmart.backend.auth.entity.Role;
import com.farmsmart.backend.auth.entity.User;
import com.farmsmart.backend.auth.repository.InvitationRepository;
import com.farmsmart.backend.auth.repository.RoleRepository;
import com.farmsmart.backend.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for managing user invitations.
 */
@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Value("${app.invitation.expiration-hours:48}")
    private int expirationHours;

    public InvitationService(InvitationRepository invitationRepository, RoleRepository roleRepository, 
                           UserRepository userRepository) {
        this.invitationRepository = invitationRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new invitation.
     */
    @Transactional
    public InvitationResponse createInvitation(InvitationRequest request, User createdBy) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        Role role = roleRepository.findByName(Role.RoleName.valueOf(request.getRole()))
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + request.getRole()));

        Invitation invitation = new Invitation();
        invitation.setEmail(request.getEmail());
        invitation.setRole(role);
        invitation.setCreatedBy(createdBy);
        invitation.setCode(UUID.randomUUID().toString());
        invitation.setExpiresAt(LocalDateTime.now().plusHours(expirationHours));
        invitation.setStatus(Invitation.InvitationStatus.PENDING);

        invitation = invitationRepository.save(invitation);

        return mapToResponse(invitation);
    }

    /**
     * Validate an invitation code.
     */
    public Invitation validateInvitation(String code) {
        return invitationRepository.findByCode(code)
                .filter(i -> i.getStatus() == Invitation.InvitationStatus.PENDING)
                .filter(i -> i.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired invitation code"));
    }

    /**
     * Mark invitation as accepted.
     */
    @Transactional
    public void markAccepted(Invitation invitation) {
        invitation.setStatus(Invitation.InvitationStatus.ACCEPTED);
        invitation.setUsedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    /**
     * Map invitation entity to response DTO.
     */
    private InvitationResponse mapToResponse(Invitation invitation) {
        return new InvitationResponse(
            invitation.getId(),
            invitation.getEmail(),
            invitation.getCode(),
            invitation.getRole().getName().name(),
            invitation.getExpiresAt(),
            invitation.getStatus().name()
        );
    }
}
