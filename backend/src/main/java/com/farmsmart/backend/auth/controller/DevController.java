package com.farmsmart.backend.auth.controller;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Utility controller for development/testing purposes.
 * Should be removed in production.
 */
@RestController
@RequestMapping("/api/dev")
@CrossOrigin(origins = "http://localhost:5173")
public class DevController {

    private final PasswordEncoder passwordEncoder;

    public DevController(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Generate BCrypt hash for a password.
     * REMOVE THIS IN PRODUCTION!
     */
    @GetMapping("/hash")
    public String generateHash(@RequestParam String password) {
        return passwordEncoder.encode(password);
    }
}
