package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.LoginAudit;
import com.farmsmart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LoginAuditRepository extends JpaRepository<LoginAudit, UUID> {
    List<LoginAudit> findByUserOrderByTimestampDesc(User user);
}
