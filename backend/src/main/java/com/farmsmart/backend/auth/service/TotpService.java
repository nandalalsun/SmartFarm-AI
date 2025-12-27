package com.farmsmart.backend.auth.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.stereotype.Service;

/**
 * TOTP (Time-based One-Time Password) service for 2FA.
 */
@Service
public class TotpService {

    private final GoogleAuthenticator googleAuthenticator;

    public TotpService() {
        this.googleAuthenticator = new GoogleAuthenticator();
    }

    /**
     * Generate a new secret key for 2FA setup.
     */
    public String generateSecretKey() {
        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        return key.getKey();
    }

    /**
     * Verify a TOTP code against a secret key.
     */
    public boolean verifyCode(String secretKey, String code) {
        try {
            int codeInt = Integer.parseInt(code);
            return googleAuthenticator.authorize(secretKey, codeInt);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * Generate QR code URL for authenticator app setup.
     */
    public String getQrCodeUrl(String email, String secretKey) {
        return String.format(
            "otpauth://totp/FarmSmart:%s?secret=%s&issuer=FarmSmart",
            email, secretKey
        );
    }
}
