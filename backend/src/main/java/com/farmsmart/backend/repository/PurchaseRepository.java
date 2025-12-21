package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PurchaseRepository extends JpaRepository<Purchase, UUID> {
}
