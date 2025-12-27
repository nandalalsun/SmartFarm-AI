package com.farmsmart.backend.auth.controller;

import com.farmsmart.backend.auth.dto.request.LoginRequest;
import com.farmsmart.backend.auth.dto.request.SignupRequest;
import com.farmsmart.backend.auth.dto.request.TokenRefreshRequest;
import com.farmsmart.backend.auth.dto.request.Verify2FARequest;
import com.farmsmart.backend.auth.dto.response.LoginResponse;
import com.farmsmart.backend.auth.dto.response.UserInfoResponse;
import com.farmsmart.backend.auth.service.AuthenticationService;
import com.farmsmart.backend.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final UserService userService;

    public AuthController(AuthenticationService authenticationService, UserService userService) {
        this.authenticationService = authenticationService;
        this.userService = userService;
    }

    /**
     * Local login endpoint.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    /**
     * 2FA verification endpoint.
     */
    @PostMapping("/verify-2fa")
    public ResponseEntity<LoginResponse> verify2fa(@Valid @RequestBody Verify2FARequest request) {
        return ResponseEntity.ok(authenticationService.verify2fa(request));
    }

    /**
     * Invitation-based signup endpoint.
     */
    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@Valid @RequestBody SignupRequest request) {
        authenticationService.signup(request);
        return ResponseEntity.ok().build();
    }

    /**
     * Token refresh endpoint.
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authenticationService.refreshToken(request));
    }

    /**
     * Get current user info endpoint.
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserInfo());
    }
}
