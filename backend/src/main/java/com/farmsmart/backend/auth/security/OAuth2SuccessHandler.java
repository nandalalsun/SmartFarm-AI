package com.farmsmart.backend.auth.security;

import com.farmsmart.backend.auth.entity.Invitation;
import com.farmsmart.backend.auth.entity.User;
import com.farmsmart.backend.auth.repository.InvitationRepository;
import com.farmsmart.backend.auth.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

/**
 * OAuth2 success handler for Google authentication.
 * Validates invitation and creates user if needed.
 */
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final InvitationRepository invitationRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public OAuth2SuccessHandler(JwtTokenProvider tokenProvider, UserRepository userRepository, 
                                InvitationRepository invitationRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.invitationRepository = invitationRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, 
                                       Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            return;
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String googleSub = oAuth2User.getAttribute("sub");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Link Google Account if not linked
            if (user.getGoogleSub() == null) {
                user.setGoogleSub(googleSub);
                userRepository.save(user);
            }
            if (!user.isEnabled()) {
                redirectWithError(request, response, "Account disabled");
                return;
            }
        } else {
            // Check for invitation
            Optional<Invitation> inviteOpt = invitationRepository.findByEmailAndStatus(
                email, Invitation.InvitationStatus.PENDING);
            
            if (inviteOpt.isEmpty() || inviteOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
                redirectWithError(request, response, "No valid invitation found");
                return;
            }

            // Accept invitation and create user
            Invitation invite = inviteOpt.get();
            invite.setStatus(Invitation.InvitationStatus.ACCEPTED);
            invite.setUsedAt(LocalDateTime.now());
            invitationRepository.save(invite);

            user = new User();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setGoogleSub(googleSub);
            user.setAuthProvider(User.AuthProvider.GOOGLE);
            user.setRoles(Collections.singleton(invite.getRole()));
            userRepository.save(user);
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens with proper authorities
        String token = tokenProvider.generateToken(email,
            new UsernamePasswordAuthenticationToken(
                email, null,
                user.getRoles().stream()
                    .map(r -> new SimpleGrantedAuthority(r.getName().name()))
                    .toList()
            )
        );

        String refreshToken = tokenProvider.generateRefreshToken(email);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("accessToken", token)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private void redirectWithError(HttpServletRequest request, HttpServletResponse response, String error) 
            throws IOException {
        getRedirectStrategy().sendRedirect(request, response,
            UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                .queryParam("error", error)
                .build().toUriString());
    }
}
