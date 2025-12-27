package com.farmsmart.backend.auth.controller;

import com.farmsmart.backend.auth.dto.request.InvitationRequest;
import com.farmsmart.backend.auth.dto.response.InvitationResponse;
import com.farmsmart.backend.auth.entity.User;
import com.farmsmart.backend.auth.repository.UserRepository;
import com.farmsmart.backend.auth.service.InvitationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for invitation management.
 */
@RestController
@RequestMapping("/api/auth/invitations")
@CrossOrigin(origins = "http://localhost:5173")
public class InvitationController {

    private final InvitationService invitationService;
    private final UserRepository userRepository;

    public InvitationController(InvitationService invitationService, UserRepository userRepository) {
        this.invitationService = invitationService;
        this.userRepository = userRepository;
    }

    /**
     * Create new invitation (ADMIN only).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<InvitationResponse> createInvitation(@Valid @RequestBody InvitationRequest request) {
        User currentUser = getCurrentUser();
        InvitationResponse response = invitationService.createInvitation(request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Validate invitation code (public endpoint).
     */
    @GetMapping("/validate/{code}")
    public ResponseEntity<Void> validateInvitation(@PathVariable String code) {
        invitationService.validateInvitation(code);
        return ResponseEntity.ok().build();
    }

    /**
     * Get current authenticated user.
     */
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
        }
        throw new IllegalStateException("No authenticated user found");
    }
}
