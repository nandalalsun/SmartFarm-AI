package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.auth.InvitationRequest;
import com.farmsmart.backend.entity.User;
import com.farmsmart.backend.entity.UserInvitation;
import com.farmsmart.backend.service.InvitationService;
import com.farmsmart.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.farmsmart.backend.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class InvitationController {

    private final InvitationService invitationService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<UserInvitation> createInvitation(@Valid @RequestBody InvitationRequest request, Authentication authentication) {
        String email = authentication.getName();
        User creator = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
        return ResponseEntity.ok(invitationService.createInvitation(request, creator));
    }

    @GetMapping("/validate/{token}")
    public ResponseEntity<UserInvitation> validateToken(@PathVariable String token) {
        return ResponseEntity.ok(invitationService.validateToken(token));
    }
}
