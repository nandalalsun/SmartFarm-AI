package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.TwoFactorAuth;
import com.farmsmart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TwoFactorAuthRepository extends JpaRepository<TwoFactorAuth, UUID> {
    Optional<TwoFactorAuth> findByUser(User user);
    void deleteByUser(User user);
}
