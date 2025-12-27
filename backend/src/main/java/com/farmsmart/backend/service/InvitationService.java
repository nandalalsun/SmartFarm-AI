package com.farmsmart.backend.service;

import com.farmsmart.backend.dto.auth.InvitationRequest;
import com.farmsmart.backend.entity.Role;
import com.farmsmart.backend.entity.User;
import com.farmsmart.backend.entity.UserInvitation;
import com.farmsmart.backend.exception.ResourceNotFoundException;
import com.farmsmart.backend.repository.RoleRepository;
import com.farmsmart.backend.repository.UserInvitationRepository;
import com.farmsmart.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final UserInvitationRepository invitationRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Value("${app.invitation.expiration-hours}")
    private int expirationHours;

    @Transactional
    public UserInvitation createInvitation(InvitationRequest request, User createdBy) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        Role role = roleRepository.findByName(Role.RoleName.valueOf(request.getRole()))
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        UserInvitation invitation = new UserInvitation();
        invitation.setEmail(request.getEmail());
        invitation.setRole(role);
        invitation.setCreatedBy(createdBy);
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setExpiresAt(LocalDateTime.now().plusHours(expirationHours));
        invitation.setStatus(UserInvitation.InvitationStatus.PENDING);

        return invitationRepository.save(invitation);
    }

    public UserInvitation validateToken(String token) {
        return invitationRepository.findByToken(token)
                .filter(i -> i.getStatus() == UserInvitation.InvitationStatus.PENDING)
                .filter(i -> i.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired invitation token"));
    }

    @Transactional
    public void markAccepted(UserInvitation invitation) {
        invitation.setStatus(UserInvitation.InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);
    }
}
