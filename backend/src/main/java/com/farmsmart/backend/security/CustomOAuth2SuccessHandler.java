package com.farmsmart.backend.security;

import com.farmsmart.backend.entity.User;
import com.farmsmart.backend.entity.UserInvitation;
import com.farmsmart.backend.repository.UserInvitationRepository;
import com.farmsmart.backend.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
import java.util.Optional;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserInvitationRepository invitationRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
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
            if (!user.isActive()) {
                getRedirectStrategy().sendRedirect(request, response, 
                    UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                        .queryParam("error", "Account disabled")
                        .build().toUriString());
                return;
            }
        } else {
            // Check for invitation
            Optional<UserInvitation> inviteOpt = invitationRepository.findByEmailAndStatus(email, UserInvitation.InvitationStatus.PENDING);
            if (inviteOpt.isEmpty() || inviteOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
                 getRedirectStrategy().sendRedirect(request, response, 
                    UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                        .queryParam("error", "No valid invitation found")
                        .build().toUriString());
                return;
            }

            // Accept invitation and create user
            UserInvitation invite = inviteOpt.get();
            invite.setStatus(UserInvitation.InvitationStatus.ACCEPTED);
            invitationRepository.save(invite);

            user = new User();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setGoogleSub(googleSub);
            user.setRoles(Collections.singleton(invite.getRole()));
            userRepository.save(user);
        }

        // Generate tokens
        // We need a fresh authentication object reflecting the DB user roles, 
        // because the input 'authentication' is just "ROLE_USER" from OAuth2
        // For simplicity here, we rely on JwtTokenProvider doing the right thing if we pass it the user details?
        // Actually JwtTokenProvider takes Authentication. We should construct one.
        // But wait, JwtTokenProvider uses authentication.getAuthorities(). 
        // The current authentication only has OAuth2 authorities.
        
        // Let's modify generateToken to accept roles or create a custom Auth based on User entity.
        // Or simpler: Update JwtTokenProvider to support generating from User entity, 
        // OR rely on CustomUserDetailsService to load it.
        
        // Hack: load UserDetails from DB
        // UserDetails userDetails = ... 
        // But doing DB lookup here is redundant with what we just did.
        
        // Use the existing generateToken(String email, Authentication authentication)
        // Check JwtTokenProvider:
        // String roles = authentication.getAuthorities()...
        
        // This is a problem. The authentication object passed here is OAuth2AuthenticationToken, which usually just has SCOPES.
        // It does NOT have the internal app roles.
        
        // FIX: I will overload generateToken in JwtTokenProvider or create a helper.
        // Ideally, I should construct a UsernamePasswordAuthenticationToken with the correct authorities and pass THAT.
        
        // Just mocking the authorities for the token generation:
        String token = tokenProvider.generateToken(email, 
            new UsernamePasswordAuthenticationToken(
                email, null, 
                user.getRoles().stream().map(r -> new SimpleGrantedAuthority(r.getName().name())).toList()
            )
        );
        
        String refreshToken = tokenProvider.generateRefreshToken(email);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("accessToken", token)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
