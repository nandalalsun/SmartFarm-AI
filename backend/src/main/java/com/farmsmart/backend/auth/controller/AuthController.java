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

import com.farmsmart.backend.auth.dto.request.ChangePasswordRequest;
import com.farmsmart.backend.auth.dto.request.TwoFactorConfirmRequest;
import com.farmsmart.backend.auth.dto.response.TwoFactorSetupResponse;

/**
 * REST controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/auth")
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
        System.out.println("LOGIN ATTEMPT: " + request.getEmail());
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

    /**
     * Update current user info endpoint.
     */
    @PutMapping("/me")
    public ResponseEntity<UserInfoResponse> updateProfile(@Valid @RequestBody com.farmsmart.backend.auth.dto.request.UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authenticationService.changePassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<TwoFactorSetupResponse> setup2fa() {
        return ResponseEntity.ok(authenticationService.initiate2faSetup());
    }

    @PostMapping("/2fa/confirm")
    public ResponseEntity<Void> confirm2fa(@Valid @RequestBody TwoFactorConfirmRequest request) {
        authenticationService.confirm2faSetup(request);
        return ResponseEntity.ok().build();
    }
}
