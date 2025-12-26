package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;


import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;


import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PurchaseRepository extends JpaRepository<Purchase, UUID>, JpaSpecificationExecutor<Purchase> {
}
