package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
}
