package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, UUID> {
    List<StockAdjustment> findByProductIdOrderByAdjustedAtDesc(UUID productId);
}
