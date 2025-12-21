package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.CreditLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CreditLedgerRepository extends JpaRepository<CreditLedger, UUID> {
    List<CreditLedger> findByCustomerId(UUID customerId);
}
