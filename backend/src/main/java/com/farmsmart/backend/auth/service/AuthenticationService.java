package com.farmsmart.backend.auth.service;

import com.farmsmart.backend.auth.dto.request.LoginRequest;
import com.farmsmart.backend.auth.dto.request.SignupRequest;
import com.farmsmart.backend.auth.dto.request.TokenRefreshRequest;
import com.farmsmart.backend.auth.dto.request.Verify2FARequest;
import com.farmsmart.backend.auth.dto.response.LoginResponse;
import com.farmsmart.backend.auth.entity.Invitation;
import com.farmsmart.backend.auth.entity.LoginAudit;
import com.farmsmart.backend.auth.entity.TwoFactorAuth;
import com.farmsmart.backend.auth.entity.User;
import com.farmsmart.backend.auth.repository.LoginAuditRepository;
import com.farmsmart.backend.auth.repository.TwoFactorAuthRepository;
import com.farmsmart.backend.auth.repository.UserRepository;
import com.farmsmart.backend.auth.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

/**
 * Service for authentication operations (login, signup, 2FA).
 */
@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InvitationService invitationService;
    private final TotpService totpService;
    private final TwoFactorAuthRepository twoFactorAuthRepository;
    private final LoginAuditRepository loginAuditRepository;

    public AuthenticationService(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider,
                                UserRepository userRepository, PasswordEncoder passwordEncoder,
                                InvitationService invitationService, TotpService totpService,
                                TwoFactorAuthRepository twoFactorAuthRepository, 
                                LoginAuditRepository loginAuditRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.invitationService = invitationService;
        this.totpService = totpService;
        this.twoFactorAuthRepository = twoFactorAuthRepository;
        this.loginAuditRepository = loginAuditRepository;
    }

    /**
     * Authenticate user with email and password.
     */
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Audit login
        logLogin(user, LoginAudit.LoginStatus.SUCCESS, "Success");

        // Check if 2FA is enabled
        if (user.isTwoFactorEnabled()) {
            // Return MFA required response
            // In production, you might want to issue a pre-auth token here
            return new LoginResponse(true);
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        String refresh = tokenProvider.generateRefreshToken(request.getEmail());

        return new LoginResponse(jwt, refresh);
    }

    /**
     * Verify 2FA code and complete authentication.
     */
    public LoginResponse verify2fa(Verify2FARequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        TwoFactorAuth tfa = twoFactorAuthRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("2FA not configured for user"));

        if (!totpService.verifyCode(tfa.getSecretKey(), request.getCode())) {
            logLogin(user, LoginAudit.LoginStatus.FAILURE, "Invalid OTP");
            throw new IllegalArgumentException("Invalid OTP code");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Create authentication with user's roles
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null,
                user.getRoles().stream()
                        .map(r -> new SimpleGrantedAuthority(r.getName().name()))
                        .toList()
        );

        String jwt = tokenProvider.generateToken(authentication);
        String refresh = tokenProvider.generateRefreshToken(request.getEmail());

        logLogin(user, LoginAudit.LoginStatus.SUCCESS, "MFA Success");

        return new LoginResponse(jwt, refresh);
    }

    /**
     * Register new user with invitation code.
     */
    @Transactional
    public void signup(SignupRequest request) {
        Invitation invitation = invitationService.validateInvitation(request.getCode());

        User user = new User();
        user.setEmail(invitation.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setAuthProvider(User.AuthProvider.LOCAL);
        user.setRoles(Collections.singleton(invitation.getRole()));

        userRepository.save(user);
        invitationService.markAccepted(invitation);

        logLogin(user, LoginAudit.LoginStatus.SUCCESS, "Signup Success");
    }

    /**
     * Refresh access token using refresh token.
     */
    public LoginResponse refreshToken(TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        String email = tokenProvider.getUsernameFromJWT(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Create authentication with user's roles
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null,
                user.getRoles().stream()
                        .map(r -> new SimpleGrantedAuthority(r.getName().name()))
                        .toList()
        );

        String newAccessToken = tokenProvider.generateToken(authentication);
        String newRefreshToken = tokenProvider.generateRefreshToken(email);

        return new LoginResponse(newAccessToken, newRefreshToken);
    }

    /**
     * Log login attempt for audit purposes.
     */
    private void logLogin(User user, LoginAudit.LoginStatus status, String reason) {
        LoginAudit audit = new LoginAudit();
        audit.setUser(user);
        audit.setEmail(user.getEmail());
        audit.setStatus(status);
        audit.setFailureReason(reason);
        loginAuditRepository.save(audit);
    }
}
