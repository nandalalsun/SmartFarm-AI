package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.UUID;

public interface SaleRepository extends JpaRepository<Sale, UUID>, JpaSpecificationExecutor<Sale> {
    List<Sale> findByCustomerIdAndPaymentStatusInOrderByCreatedAtAsc(UUID customerId, List<String> statuses);
    
    // Specification executor handles dynamic filtering now
}
